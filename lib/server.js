'use strict';
var express = require('express');
var session = require('express-session');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var compress = require('compression');
var lusca = require('lusca');
var errorhandler = require('errorhandler');
var cors = require('cors');
var path = require('path');
var serveStatic = require('serve-static');
var flash = require('express-flash');
var passport = require('passport');
var config = require('config');
var routes = require('./routes');
var configurePassport = require('./passport');

var publicDir = path.resolve(__dirname, '../public');
var sessionSecret = config.get('sessionSecret');

module.exports = function (resources) {
  var server = express();

  configurePassport(passport, resources.repositories.Users);

  // expose resources to routes
  server.use(function (req, res, next) {
    req.resources = resources;
    next();
  });

  // configuration and global middleware
  server.use(cors());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());
  server.use(expressValidator());
  server.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
  server.use(lusca.csrf());
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(flash());
  server.use(compress());
  server.use(serveStatic(publicDir));
  server.set('views', path.join(__dirname, 'views'));
  server.set('view engine', 'jade');
  server.disable('x-powered-by');

  // expose logged in user to views
  server.use('*', function (req, res, next) {
    res.locals.user = req.user;
    next();
  });

  // mount routes to server
  routes.mount(server);

  // not found handler
  server.use(function (req, res) {
    res.status(404).send({ error: 'Not Found' });
  });

  // error handler
  server.use(errorhandler());

  return server;
};
