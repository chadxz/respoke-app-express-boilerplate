'use strict';
var gravatar = require('gravatar');

exports.getGravatarUrl = function (email) {
  return gravatar.url(email, { d: 'retro'}, true);
};
