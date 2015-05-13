'use strict';
var express = require('express');
var config = require('config');
var ensureAuthenticated = require('./middleware').ensureAuthenticated;
var router = express.Router();

router.all('/account/*', ensureAuthenticated);

router.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account/profile', {
    title: 'Account Management',
    githubEnabled: config.get('github.enabled'),
    googleEnabled: config.get('google.enabled'),
    twitterEnabled: config.get('twitter.enabled')
  });
});

router.post('/account/profile', function (req, res, next) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    res.redirect('/account');
    return;
  }

  var user = req.user;
  user.email = req.body.email;
  user.name = req.body.name;
  user.save(function (err) {
    if (err) {
      next(err);
      return;
    }

    req.flash('success', { msg: 'Profile information updated.' });
    res.redirect('/account');
  });
});

router.post('/account/password', function (req, res, next) {
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    res.redirect('/account');
    return;
  }

  var user = req.user;
  var hadPassword = !!user.password;
  user.password = req.body.password;
  user.save(function (err) {
    if (err) {
      next(err);
      return;
    }

    req.flash('success', { msg: hadPassword ? 'Password changed.' : 'Password set.' });
    res.redirect('/account');
  });
});

router.post('/account/delete', function (req, res, next) {
  var user = req.user;
  user.destroy(function (err) {
    if (err) {
      next(err);
      return;
    }

    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
});

router.get('/account/unlink/:provider', function (req, res, next) {
  var validProviders = ['github', 'twitter', 'google'];
  req.assert('provider', 'Invalid provider').isIn(validProviders);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    res.redirect('/account');
    return;
  }

  var provider = req.params.provider;
  var user = req.user;
  var remainingProviders = validProviders.filter(function (validProvider) {
    return (validProvider !== provider) && !!user[validProvider];
  });

  if (!remainingProviders.length && (!user.password || !user.email)) {
    req.flash('errors', [{ msg: 'You cannot unlink the last remaining method of authentication. ' +
      'Please link a different account, or set an email address and password.' }]);
    res.redirect('/account');
    return;
  }

  delete user[provider];

  user.save(function (err) {
    if (err) {
      next(err);
      return;
    }

    req.flash('info', { msg: provider + ' account has been unlinked.' });
    res.redirect('/account');
  });
});

module.exports = router;
