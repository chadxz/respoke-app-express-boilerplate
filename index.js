'use strict';
var createServer = require('./lib/server');
var config = require('config');
var Datastore = require('nedb');
var UsersRepository = require('./lib/repositories/UsersRepository');
var port = config.get('port');
var usersDataFile = config.get('nedb.datapaths.users');
var usersStore = new Datastore({ filename: usersDataFile, autoload: true });

var resources = {
  repositories: {
    Users: new UsersRepository({ store: usersStore })
  }
};

var server = createServer(resources);

server.listen(port, function () {
  console.log('listening on port ' + port);
});
