'use strict';
var nodeify = require('nodeify');

/**
 * Create a new instance of RespokeService
 *
 * @param {object} params
 * @param {object} params.client An instantiated Respoke client
 * @param {string} params.roleId the role id to use when retrieving auth tokens
 * @param {string} params.ttl the ttl to use when retrieving auth tokens
 * @constructor
 */
function RespokeService(params) {
  Object.defineProperties(this, {
    client: {
      enumerable: false,
      configurable: false,
      get: function () {
        return params.client;
      }
    },
    roleId: {
      enumerable: false,
      configurable: false,
      get: function () {
        return params.roleId;
      }
    },
    ttl: {
      enumerable: false,
      configurable: false,
      get: function () {
        return params.ttl;
      }
    },
    appId: {
      enumerable: true,
      configurable: false,
      get: function () {
        return params.client.appId;
      }
    },
    baseURL: {
      enumerable: true,
      configurable: false,
      get: function () {
        return params.client.baseURL;
      }
    }
  });
}

/**
 * Retrieve a Respoke auth token, for use by a web client when connecting to Respoke.
 *
 * @param {object} params
 * @param {string} params.endpointId the endpointId the token should be assigned
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
    roleId: this.roleId,
    ttl: this.ttl || 86400 // defaults to 1 day
  };

  return this.client.auth.endpoint(tokenParams).then(function (authData) {
    return authData.tokenId;
  });
};

module.exports = RespokeService;
