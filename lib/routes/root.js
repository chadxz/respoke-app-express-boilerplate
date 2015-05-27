'use strict';
var express = require('express');
var passport = require('passport');
var config = require('config');
var ensureAuthenticated = require('./middleware').ensureAuthenticated;
var router = express.Router();

router.get('/', ensureAuthenticated, function (req, res) {
  res.render('home', { title: 'Home' });
});

router.get('/login', function (req, res) {
  if (req.user) {
    res.redirect('/');
    return;
  }

  res.render('account/login', {
    title: 'Login',
    githubEnabled: config.get('github.enabled'),
    googleEnabled: config.get('google.enabled'),
    twitterEnabled: config.get('twitter.enabled')
  });
});

router.post('/login', function (req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) {
      next(err);
      return;
    }

    if (!user) {
      req.flash('errors', { msg: info.message });
      res.redirect('/login');
      return;
    }

    req.logIn(user, function (err) {
      if (err) {
        next(err);
        return;
      }

      var returnTo = req.session.returnTo;
      delete req.session.returnTo;

      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(returnTo || '/');
    });
  })(req, res, next);
});

router.get('/signup', function (req, res) {
  if (req.user) {
    res.redirect('/');
    return;
  }

  res.render('account/signup', { title: 'Signup' });
});

router.post('/signup', function (req, res, next) {
  var Users = req.resources.repositories.Users;

  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    res.redirect('/signup');
    return;
  }

  var params = {
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    password: req.body.password
  };

  Users.findOneByEmail(params.email, function (err, existingUser) {
    if (err) {
      next(err);
      return;
    }

    if (existingUser) {
      req.flash('errors', { msg: 'An account with that email address already exists.' });
      res.redirect('/signup');
      return;
    }

    Users.create(params, function (err, user) {
      if (err) {
        next(err);
        return;
      }

      req.logIn(user, function (err) {
        if (err) {
          next(err);
          return;
        }

        var returnTo = req.session.returnTo;
        delete req.session.returnTo;

        req.flash('success', { msg: 'Success! You are logged in.' });
        res.redirect(returnTo || '/');
      });
    });
  });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
