/* global
  $: false,
  respoke: false,
  config: false
 */
;(function () {
  'use strict';
  if (!config.respoke) {
    return;
  }

  var $respokeStatus = $('#respokeStatus');
  respoke.log.setLevel(respoke.log.levels.DEBUG);
  var client = window.client = respoke.createClient({
    baseURL: config.respoke.baseURL,
    appId: config.respoke.appId
  });

  function reconnect() {
    $.get('/respoke/token').then(function (res) {
      return client.connect({ token: res.token });
    }).then(function () {
      console.log('Respoke Reconnected!');
      $respokeStatus.text('Respoke Reconnected!');
    }).fail(function (err) {
      console.error(err);
      $respokeStatus.text('Respoke reconnection failed. See console for details');
    });
  }

  client.connect({
    token: config.respoke.token,
    onDisconnect: reconnect
  }).then(function () {
    console.log('Respoke Connected!');
    $respokeStatus.text('Respoke Connected!');
  }).fail(function (err) {
    console.error(err);
    $respokeStatus.text('Respoke connection failed. See console for details');
  });

})();
