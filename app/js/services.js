'use strict';

/* Services */

var services = angular.module('devcenterTest.services', []);

services.factory('uuidGenerator', function() {
  return function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
});

services.factory('user', ['uuidGenerator', '$rootScope', 'devcenterClient', function(uuidGenerator, rootScope, devcenterClient) {
  rootScope.currentUser = null;
  rootScope.loggedIn = false;
  return {
    currentUser: function() {return rootScope.currentUser},
    login: function(uuid) {
      if (uuid !== undefined) {
        rootScope.currentUser = uuid;
      } else {
        rootScope.currentUser = uuidGenerator();
      }
      rootScope.loggedIn = (!!rootScope.currentUser);
      if (rootScope.loggedIn) {
        return devcenterClient.promoteDeveloper(rootScope.currentUser);
      }
      alert("Could not log you in. Sorry!");
    },
    logout: function() {
      rootScope.currentUser = null;
      rootScope.loggedIn = false;
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
