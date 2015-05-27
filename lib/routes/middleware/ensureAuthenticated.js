'use strict';

/*
 * Ensure the request is authenticated. If it is not, redirect to the login page
 */
module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  req.session.returnTo = req.path;
  res.redirect('/login');
};
