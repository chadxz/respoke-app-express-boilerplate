'use strict';

/*
 * Ensure that the respoke service is available.
 * If it is not, respond with a service unavailable response.
 */
module.exports = function (req, res, next) {
  if (req.resources.respoke) {
    next();
    return;
  }

  res.status(503).send({
    error: 'Service Unavailable',
    statusCode: 503,
    message: 'The server is not currently configured to communicate with Respoke.'
  });
};
