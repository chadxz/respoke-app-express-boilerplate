'use strict';
var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

router.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

module.exports = router;
