'use strict';

var routers = require('fs').readdirSync(__dirname + '/').filter(function (file) {
  return (file.match(/\.js$/) !== null) && (file !== 'index.js');
}).map(function (file) {
  return require('./' + file);
});

module.exports = {
  mount: function (server) {
    routers.forEach(function (router) {
      server.use(router);
    });
  }
};
