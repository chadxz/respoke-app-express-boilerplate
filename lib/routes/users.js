'use strict';
var express = require('express');
var middleware = require('./middleware');
var ensureAuthenticated = middleware.ensureAuthenticated;
var router = express.Router();

/**
 * Retrieve details about all users on the system
 */
router.get('/users', ensureAuthenticated, function (req, res, next) {
  var Users = req.resources.repositories.Users;

  Users.find().then(function (users) {
    var results = users.map(function (user) {
      return {
        id: user._id,
        name: user.name,
        picture: user.picture
      };
    });

    res.status(200).send(results);
  }).catch(next);
});

/**
 * Retrieve details about a specific user on the system
 */
router.get('/users/:id', ensureAuthenticated, function (req, res, next) {
  var Users = req.resources.repositories.Users;
  var id = req.params.id;

  Users.findOneById(id).then(function (user) {

    res.status(200).send({
      id: user._id,
      name: user.name,
      picture: user.picture
    });
  }).catch(next);
});

module.exports = router;
