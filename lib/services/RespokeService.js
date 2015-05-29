'use strict';
var nodeify = require('nodeify');

/**
 * Create a new instance of RespokeService
 *
 * @param {object} params
 * @param {object} params.client An instantiated Respoke client
 * @constructor
 */
function RespokeService(params) {
  // make the 'client' property a non-enumerable getter
  Object.defineProperty(this, 'client', {
    enumerable: false,
    configurable: false,
    get: function () {
      return params.client;
    }
  });
}

/**
 * Retrieve a Respoke auth token, for use by a web client when connecting to Respoke.
 *
 * @param {object} params
 * @param {string} params.endpointId the endpointId the token should be assigned
 * @param {string} [params.roleId] the id of the role the token should be assigned
 * @param {number} [params.ttl=86400] the duration (in seconds) that the token should valid
 * @param {function} [callback] signature (err, token)
 * @returns {Promise} if callback is not provided, returns a promise which resolves to the token
 * @memberof RespokeService
 */
RespokeService.prototype.retrieveAuthToken = function (params, callback) {

  if (callback) {
    return nodeify(this.retrieveAuthToken(params), callback);
  }

  var tokenParams = {
    endpointId: params.endpointId,
    roleId: params.roleId,
    ttl: params.ttl || 86400 // defaults to 1 day
  };

  return this.client.auth.endpoint(tokenParams).then(function (authData) {
    return authData.tokenId;
  });
};

module.exports = RespokeService;
