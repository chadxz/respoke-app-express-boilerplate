'use strict';
var path = require('path');

module.exports = {
  port: 8080,
  sessionSecret: 'super secure session secret that is not keyboard cat',
  nedb: {
    datapaths: {
      users: path.join(path.dirname(require.main.filename), 'users.nedb')
    }
  },
  google: {
    enabled: false,
    clientID: '',
    clientSecret: ''
  },
  github: {
    enabled: false,
    clientID: '',
    clientSecret: ''
  },
  twitter: {
    enabled: false,
    consumerKey: '',
    consumerSecret: ''
  },
  respoke: {
    baseURL: 'https://api.respoke.io/v1',
    appId: '',
    appSecret: '',
    roleId: '',
    tokenTTLSeconds: 86400 // optional, defaults to 1 day
  }
};
