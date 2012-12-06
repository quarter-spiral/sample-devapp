'use strict';

/* Filters */

angular.module('devcenterTest.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('canvasUrl', [function() {
    return function(gameUuid, venue) {
      return String(qs.ENV.QS_CANVAS_APP_URL + "/v1/games/" + gameUuid + "/" + venue);
    };
  }]);
