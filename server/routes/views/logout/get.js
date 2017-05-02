'use strict';

const Route = require('conjure-core/classes/Route');

const route = new Route();

/*
  Passport session logout
 */
route.push((req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = route;