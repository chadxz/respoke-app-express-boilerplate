'use strict';
var express = require('express');
var passport = require('passport');
var router = express.Router();

/**
 * Start Github social signon OAuth flow
 */
router.get('/auth/github', passport.authenticate('github'));

/**
 * Complete Github social signon OAuth flow
 */
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Start Google social signon OAuth flow
 */
router.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));

/**
 * Complete Google social signon OAuth flow
 */
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Start Twitter social signon OAuth flow
 */
router.get('/auth/twitter', passport.authenticate('twitter'));

/**
 * Complete Twitter social signon OAuth flow
 */
router.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

module.exports = router;
