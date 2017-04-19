'use strict';

const Route = require('classes/Route');
const log = require('modules/log')('proxy debug');

const route = new Route({
  blacklistedEnv: {
    NODE_ENV: ['production']
  },

  wildcard: true
});

/*
  dev endpoint to debug env vars
 */
route.push((req, res) => {
  const ReqProxy = require('classes/Req/Proxy');

  const proxy = new ReqProxy({
    host: 'google.com',
    port: 80
  });

  proxy.forward(req, res);
});

module.exports = route;