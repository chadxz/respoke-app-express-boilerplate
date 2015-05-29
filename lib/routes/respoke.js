'use strict';
var express = require('express');
var middleware = require('./middleware');
var ensureAuthenticated = middleware.ensureAuthenticated;
var ensureRespokeAvailable = middleware.ensureRespokeAvailable;
var router = express.Router();

router.get('/respoke/token', ensureAuthenticated, ensureRespokeAvailable, function (req, res, next) {
  req.resources.respoke.retrieveAuthToken({ endpointId: req.user._id }).then(function (token) {
    res.status(200).send({ token: token });
  }).catch(next);
});

module.exports = router;
