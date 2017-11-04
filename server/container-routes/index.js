const log = require('conjure-core/modules/log')('container routing');
const config = require('conjure-core/modules/config');
const nextApp = require('../next');

// converting 'conjure.sh' to '\\.conjure\\.sh', to prepare it for regexp
const domainExprPart = `.${config.app.web.domain}`.replace(/\./g, '\\.');
const subdomainExpr = new RegExp(`^([\\w\\.]*)${domainExprPart}(?!\\w)`, 'i');
const containerLogsExpr = new RegExp(`^(\\w+)\\.(\\w+)${domainExprPart}(?!\\w)`, 'i');

module.exports = (req, res, next) => {
  // if not a subdomain request, kick to next, unless www.
  const subdomainMatch = subdomainExpr.exec(req.headers.host);
  if (!subdomainMatch || subdomainMatch[1] === 'www') {
    return next();
  }

  const containerMatch = containerLogsExpr.exec(req.headers.host);
  if (!containerMatch) {
    return next();
  }

  const containerId = containerMatch[1];
  const handler = containerMatch[2];

  switch(handler) {
    case 'view':
    case 'logs':
      return checkPermissions(req, res, containerId, handler, next);


      // const viewHandler = require('./view.js');
      // return viewHandler(req, res, containerId, next);

    
      // const logsHandler = require('./logs.js');
      // return logsHandler(req, res, containerId, next);

    default:
      return nextApp.render(req, res, '/_error');
  }
};

const validRequestors = {};

async function checkPermissions(req, res, uid, handler, next) {
  const onSuccess = containerRecord => {
    validRequestors[ req.cookies.conjure ] = true; // todo: remove this tmp hack to cache valid requestors
    return require(`./${handler}.js`)(req, res, containerRecord, next);
  };

  const DatabaseTable = require('conjure-core/classes/DatabaseTable');

  // pull up the container record being accessed
  let containers;
  try {
    containers = await DatabaseTable.select('container', {
      url_uid: uid
    });
  } catch(err) {
    return next(err);
  }

  if (!containers.length) {
    // no proxy record found
    log.info(`No container found for uid ${uid}`);
    return nextApp.render(req, res, '/_error');
  }

  const containerRecord = containers[0];

  // check if perms already set
  if (validRequestors[ req.cookies.conjure ]) {
    return onSuccess(containerRecord);
  }

  // check permissions
  let watchedRepoRecords;
  try {
    watchedRepoRecords = await DatabaseTable.select('watched_repo', {
      id: containerRecord.repo
    });
  } catch(err) {
    return next(err);
  }

  if (!watchedRepoRecords.length) {
    // no watched repo record found - this should not happen
    log.info(`No 'watched_repo' record found for container row`);
    return nextApp.render(req, res, '/_error');
  }

  const watchedRepo = watchedRepoRecords[0];

  // if not a private repo, then skip additional checks, and allow user to proceed
  if (!watchedRepo.private) {
    return onSuccess(containerRecord);
  }

  // if user is not logged in, then block access until they do so
  if (!req.isAuthenticated()) {
    return nextApp.render(req, res, '/terminal/private/requires-auth');
  }

  const apiGetAccountGitHub = require('conjure-api/server/routes/api/account/github/get.js').call;
  const gitHubAccount = (await apiGetAccountGitHub(req)).account;
  
  // must be a private repo - will need to check if user has perms
  // not using our own db, will check against github directly
  const apiGetRepos = require('conjure-api/server/routes/api/repos/get.js').call;
  const getReposResult = await apiGetRepos(req);
  const orgRepos = result.reposByOrg[ watchedRepo.org ];

  // if user has no repos in the containers org...
  if (!orgRepos) {
    log.info(`Restricted access of container '${uid}', within org ${watchedRepo.org} - user does not have access to org`);
    nextApp.render(req, res, '/terminal/private/invalid-permissions', {
      account: {
        photo: gitHubAccount.photo // todo: not rely on github...
      },
      orgs
    });
    return;
  }

  // filtering down to the container's repo record
  let repo;
  for (let i = 0; i < orgRepos.length; i++) {
    if (orgRepos[i].id === parseInt(watchedRepo.service_repo_id, 10)) {
      repo = orgRepos[i];
      break;
    }
  }

  // if that repo does not exist, kick to 404
  if (!repo) {
    log.info(`Restricted access of container '${uid}', within org ${watchedRepo.org} - user does not have access to repo`);
    nextApp.render(req, res, '/terminal/private/invalid-permissions', {
      account: {
        photo: gitHubAccount.photo // todo: not rely on github...
      },
      orgs
    });
    return;
  }

  // if perms are not correct, kick to 404
  // only check if have read access
  if (!repo.permissions || repo.permissions.pull !== true) {
    log.info(`Restricted access of container '${uid}', within org ${watchedRepo.org} - user does not have proper perms`);
    nextApp.render(req, res, '/terminal/private/invalid-permissions', {
      account: {
        photo: gitHubAccount.photo // todo: not rely on github...
      },
      orgs
    });
    return;
  }

  onSuccess(containerRecord);
};
