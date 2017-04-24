'use strict';

const log = require('modules/log')('github container create');

// todo: set up a module that handles cases like this
const asyncBreak = {};
let workerPort = parseInt(process.env.PORT, 10);
const bashNoOp = ':';

function containerCreate(orgName, repoName, payload, callback) {
  log.info('starting create');

  const uid = require('uid');

  const containerUid = uid(24);
  const waterfall = [];

  // get watched repo record
  waterfall.push(cb => {
    payload.watchedRepoRecord(cb);
  });

  // make sure the repo/branch is not already spun up
  waterfall.push((watchedRepo, cb) => {
    const DatabaseTable = require('classes/DatabaseTable');
    // todo: detect correct server host, but on develop / test keep localhost
    DatabaseTable.select('container_proxies', {
      repo: watchedRepo.id,
      commit_sha: payload.sha
    }, (err, records) => {
      if (err) {
        return cb(err);
      }

      if (records.length) {
        return cb(asyncBreak);
      }

      cb(null, watchedRepo);
    });
  });

  // get github client
  waterfall.push((watchedRepo, cb) => {
    // todo: store github repo key on repo level, since 'sender' may differ
    payload.getGitHubAccount((err, gitHubAccount) => {
      if (err) {
        return cb(err);
      }

      if (!gitHubAccount) {
        return cb(new Error('No github account record found'));
      }

      const github = require('octonode');
      const gitHubClient = github.client(gitHubAccount.access_token);

      cb(null, watchedRepo, gitHubClient);
    });
  });

  // get yml config
  waterfall.push((watchedRepo, gitHubClient, cb) => {
    gitHubClient
      .repo(`${orgName}/${repoName}`)
      .contents('voyant.yml', payload.sha, (err, file) => {
        // todo: handle errors, send a message to client/github
        if (
          (err && err.message === 'Not Found') ||
          (!file || file.type !== 'file' || typeof file.content !== 'string')
        ) {
          return cb(new Error('No Voyant YML config present in repo'));
        }

        if (err) {
          return cb(err);
        }

        const yml = new Buffer(file.content, 'base64');
        const Config = require('classes/Repo/Config');
        const repoConfig = new Config(yml);

        // todo: handle invalid yml errors better, send message to client/github
        if (repoConfig.valid === false) {
          return cb(new Error('Invalid Voyant YML config'));
        }

        cb(null, watchedRepo, repoConfig, gitHubClient);
      });
  });

  // create container
  waterfall.push((watchedRepo, repoConfig, gitHubClient, cb) => {
    const exec = require('child_process').exec;
    // todo: handle non-github repos
    // todo: properly populate setup comamnd
    
    let preSetupSteps = '';

    if (repoConfig.machine.pre.length) {
      preSetupSteps = repoConfig.machine.pre
        .map(command => {
          return `RUN ${command}`;
        })
        .join('\n');
      preSetupSteps = new Buffer(preSetupSteps).toString('base64');
    }

    const command = `bash ./build.sh "git@github.com:${orgName}/${repoName}.git" "${payload.sha}" "${containerUid}" "${preSetupSteps}" "${repoConfig.machine.setup || bashNoOp}"`;

    log.info(command);
    exec(command, {
      cwd: process.env.VOYANT_WORKER_DIR
    }, (err, stdout, stderr) => {
      if (err) {
        return cb(err);
      }

      if (stderr) {
        return cb(new Error(stderr));
      }

      // if (stdout) {
      //   console.log(stdout);
      // }

      cb(null, watchedRepo, repoConfig, gitHubClient);
    });
  });

  // run container
  waterfall.push((watchedRepo, repoConfig, gitHubClient, cb) => {
    if (repoConfig.machine.start === null) {
      return cb(new Error('No container start command defined or known'));
    }

    const exec = require('child_process').exec;
    // todo: handle command properly

    // may need to keep trying, if docker ports are already in use
    function attemptDockerRun() {
      const hostPort = ++workerPort;

      const command = `docker run --cidfile /tmp/${containerUid}.cid -i -t -d -p ${hostPort}:${repoConfig.machine.port} "${containerUid}" ${repoConfig.machine.start}`;

      log.info(command);
      exec(command, {
        cwd: process.env.VOYANT_WORKER_DIR
      }, (err, stdout, stderr) => {
        const errSeen = err ? err :
          stderr ? new Error(stderr) :
          null;

        if (errSeen) {
          exec(`rm /tmp/${containerUid}.cid`, rmCidErr => {
            if (rmCidErr) {
              log.error(rmCidErr);
            }

            if (errSeen.message && errSeen.message.includes('port is already allocated')) {
              log.info('port is already allocated - attempting again');
              return attemptDockerRun();
            }

            cb(errSeen);
          });
          return;
        }

        // if (stdout) {
        //   console.log(stdout);
        // }

        cb(null, watchedRepo, gitHubClient, hostPort, stdout.trim());
      });
    }
    attemptDockerRun();
  });

  // save reference for container
  waterfall.push((watchedRepo, gitHubClient, hostPort, containerId, cb) => {
    const DatabaseTable = require('classes/DatabaseTable');
    // todo: detect correct server host, but on develop / test keep localhost
    DatabaseTable.insert('container_proxies', {
      repo: watchedRepo.id,
      commit_sha: payload.sha,
      host: 'localhost',
      port: hostPort,
      container_id: containerId,
      url_uid: containerUid,
      added: new Date()
    }, err => {
      cb(err, hostPort, gitHubClient);
    });
  });

  waterfall.push((hostPort, gitHubClient, cb) => {
    const config = require('modules/config');
    const {
      protocol,
      domain
    } = config.app;

    // todo: not use user's account to post comment (may not be possible, unless can get integration access from github)
    gitHubClient
      .issue(`${orgName}/${repoName}`, payload.number)
      .createComment({
        body: `${protocol}://${domain}:${hostPort}`
      }, err => {
        cb(err);
      });
  });

  const async = require('async');
  async.waterfall(waterfall, err => {
    if (err === asyncBreak) {
      return callback();
    }

    callback(err);
  });
}

module.exports = containerCreate;
