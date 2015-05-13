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
  }
};
