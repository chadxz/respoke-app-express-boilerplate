'use strict';

/*
 * Ensure the request is authenticated. If it is not, redirect to the login page
 */
module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  if (req.xhr) {
    res.status(401).send({
      error: 'Not Authorized',
      statusCode: 401,
      message: 'You must be logged in to perform this action.'
    });
    return;
  }

  req.session.returnTo = req.path;
  res.redirect('/login');
};
