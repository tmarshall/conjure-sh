const Route = require('conjure-core/classes/Route');
const nextApp = require('../../next');

const route = new Route();

route.push((req, res, next) => {
  nextApp.render(req, res, '/onboard/orgs');
});

module.exports = route;
