'use strict';

/* Services */

var services = angular.module('devcenterTest.services', []);

services.factory('user', ['$rootScope', '$cookies', 'devcenterClient', function(rootScope, cookies, devcenterClient) {
  rootScope.currentUser = null;
  rootScope.loggedIn = false;

  var storeLogin = function(uuid) {
    rootScope.currentUser = uuid;
    if (uuid) {
      devcenterClient.promoteDeveloper(rootScope.currentUser);
    }
    rootScope.loggedIn = !!(rootScope.currentUser);
    return uuid;
  }

  return {
    currentUser: function() {
      var uuid = rootScope.currentUser;
      if (!uuid) {
        var cookie = angular.fromJson(cookies['qs_authentication']);
        if (cookie && cookie.info && cookie.info.uuid) {
          uuid = storeLogin(cookie.info.uuid);
        }
      }
      return uuid;
    },
    logout: function() {
      delete cookies['qs_authentication']
      storeLogin(null);
      var redirectUrl = window.location.protocol + '//' + window.location.host;
      window.location.href = window.qs.ENV['QS_OAUTH_SITE'] + '/users/sign_out?redirect_uri=' + encodeURI(redirectUrl);
    }
  };
}]);

services.factory('devcenterClient', ['$http', '$q', function(http, q) {
  http.makeRequest = function(options) {
    var method = options.method;
    var url = options.url;
    var body = options.body;

    var deferred = q.defer();

    var requestOptions = {method: method, url: url};
    if (body) {
      requestOptions.data = body;
    }

    http(requestOptions).
      success(function(data, status, headers, config) {
        if (options.returns !== undefined) {
          deferred.resolve(options.returns(data, status, headers, config));
        } else {
          deferred.resolve();
        }
      }).
      error(function(data, status, headers, config) {
        deferred.reject(data.error);
     });

    return deferred.promise;
  };

  var devcenterBackendUrl = window.qs.ENV['QS_DEVCENTER_BACKEND_URL'];

  var lastUpload = null;
  var windowProxy = new Porthole.WindowProxy(window.location.href.replace(/\/\/([^\/]*).*$/, '/$1/partials/games/flash/upload_done.html'));
  windowProxy.addEventListener(function(e) {
    lastUpload = e.data.url;
  });
  Porthole.WindowProxyDispatcher.start();

  return {
    promoteDeveloper: function(uuid) {
      return http.makeRequest({
        method: 'POST',
        url: devcenterBackendUrl + '/developers/' + uuid
      });
    },

    demoteDeveloper: function(uuid) {
      return http.makeRequest({
        method: 'DELETE',
        url: devcenterBackendUrl + '/developers/' + uuid
      });
    },

    listGames: function(developerUuid) {
      return http.makeRequest({
        method: 'GET',
        url: devcenterBackendUrl + '/developers/' + developerUuid + '/games',
        returns: function(data) {
          return data;
        }
      });
    },

    addGame: function(gameDetails) {
      return http.makeRequest({
        method: 'POST',
        url: devcenterBackendUrl + '/games',
        body: gameDetails,
        returns: function(data) {
          return data;
        }
      });
    },

    addDeveloper: function(gameUuid, developerUuid) {
      return http.makeRequest({
        method: 'POST',
        url: devcenterBackendUrl + '/games/' + gameUuid + '/developers/' + developerUuid,
        returns: function(data) {
          return data;
        }
      });
    },

    removeDeveloper: function(gameUuid, developerUuid) {
      return http.makeRequest({
        method: 'DELETE',
        url: devcenterBackendUrl + '/games/' + gameUuid + '/developers/' + developerUuid,
        returns: function(data) {
          return data;
        }
      });
    },

    deleteGame: function(gameUuid) {
      return http.makeRequest({
        method: 'DELETE',
        url: devcenterBackendUrl + '/games/' + gameUuid,
      });
    },

    updateGame: function(gameUuid, gameDetails) {
      if (gameDetails.configuration.type == 'flash') {
        gameDetails.configuration.url = lastUpload;
      }
      return http.makeRequest({
        method: 'PUT',
        url: devcenterBackendUrl + '/games/' + gameUuid,
        body: gameDetails,
        returns: function(data) {
          return data;
        }
      });
    },

    getGame: function(gameUuid, options) {
      return http.makeRequest({
        method: 'GET',
        url: devcenterBackendUrl + '/games/' + gameUuid,
        returns: function(data) {
          if (options && options.mode && options.mode == 'edit') {
            if (data.configuration.type == 'flash') {
              lastUpload = data.configuration.url;
            }
          }
          return data;
        }
      });
    }
  };
}]);
