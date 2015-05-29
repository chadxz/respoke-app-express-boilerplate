'use strict';
var express = require('express');
var config = require('config');
var middleware = require('./middleware');
var ensureAuthenticated = middleware.ensureAuthenticated;
var ensureRespokeAvailable = middleware.ensureRespokeAvailable;
var router = express.Router();

router.get('/respoke/token', ensureAuthenticated, ensureRespokeAvailable, function (req, res, next) {
  var endpointId = req.user._id;
  var roleId = config.get('respoke.roleId');
  var ttl = config.get('respoke.tokenTTLSeconds');

  var params = {
    endpointId: endpointId,
    roleId: roleId,
    ttl: ttl
  };

  req.resources.respoke.retrieveAuthToken(params).then(function (token) {
    res.status(200).send({ token: token });
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;
