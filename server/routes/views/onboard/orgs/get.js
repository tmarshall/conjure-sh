const Route = require('conjure-core/classes/Route');
const UnexpectedError = require('conjure-core/modules/err').UnexpectedError;
const nextApp = require('../../../../next');
const log = require('conjure-core/modules/log')('onboard orgs');

const route = new Route({
  requireAuthentication: true,
  skippedHandler: (req, res) => {
    nextApp.render(req, res, '/_error');
  }
});

route.push((req, res) => {
  const waterfall = [];

  waterfall.push(callback => {
    const apiGetAccountGitHub = require('conjure-api/server/routes/api/account/github/get.js').direct;
    apiGetAccountGitHub(req, null, (err, result) => {
      if (err) {
        return callback(err);
      }

      callback(null, result.account);
    });
  });

  waterfall.push((gitHubAccount, callback) => {
    const apiGetOrgs = require('conjure-api/server/routes/api/orgs/get.js').direct;
    apiGetOrgs(req, null, (err, result) => {
      if (err) {
        return callback(err);
      }

      callback(null, gitHubAccount, result.orgs);
    });
  });

  const asyncWaterfall = require('conjure-core/modules/async/waterfall');
  asyncWaterfall(waterfall, (err, gitHubAccount, orgs) => {
    if (err) {
      log.error(err);
      return nextApp.render(req, res, '/_error');
    }

    nextApp.render(req, res, '/onboard/orgs', {
      account: {
        photo: gitHubAccount.photo
      },
      orgs
    });
  });
});

module.exports = route;