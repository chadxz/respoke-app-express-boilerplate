'use strict';
var createServer = require('./lib/server');
var config = require('config');
var Datastore = require('nedb');
var RespokeClient = require('respoke-admin');
var RespokeService = require('./lib/services/RespokeService');
var UsersRepository = require('./lib/repositories/UsersRepository');
var usersDataFile = config.get('nedb.datapaths.users');
var usersStore = new Datastore({ filename: usersDataFile, autoload: true });

// setup database

var resources = {
  repositories: {
    Users: new UsersRepository({ store: usersStore })
  }
};

// setup respoke client

var appId = config.get('respoke.appId');
var appSecret = config.get('respoke.appSecret');
var baseURL = config.get('respoke.baseURL');

if (appId && appSecret) {
  resources.respoke = new RespokeService({
    client: new RespokeClient({
      baseURL: baseURL,
      appId: appId,
      'App-Secret': appSecret
    })
  });
} else {
  console.warn('Respoke not configured. Please copy config/default.js to config/local.js and ' +
    'define the respoke properties to enable Respoke token retrieval.');
}

// start server

var server = createServer(resources);
var port = config.get('port');

server.listen(port, function () {
  console.log('listening on port ' + port);
});
