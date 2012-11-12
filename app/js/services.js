'use strict';

/* Services */

var services = angular.module('devcenterTest.services', []);

var getDevcenterBackendUrl = function() {return window.qs.ENV['QS_DEVCENTER_BACKEND_URL'] + '/v1';}

services.factory('qs_http', ['$q', '$http', function(q, http) {
  var userService = null;
  return {
    setUserService: function(newService) {
      userService = newService;
    },
    makeRequest: function(options) {
      var method = options.method;
      var url = options.url;
      var body = options.body;

      var deferred = q.defer();

      var requestOptions = {method: method, url: url};
      if (body) {
        requestOptions.data = body;
      }

      var headers = {
        "Authorization": "Bearer " + userService.currentUser().token
      }
      requestOptions['headers'] = headers;

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
    }
  };
}]);

services.factory('user', ['$rootScope', '$cookies', 'qs_http', function(rootScope, cookies, http) {
  rootScope.currentUser = null;
  rootScope.loggedIn = false;
  var devcenterBackendUrl = getDevcenterBackendUrl();

  var storeLogin = function(user) {
    rootScope.currentUser = user;
    if (user) {
      http.makeRequest({
        method: 'POST',
        url: devcenterBackendUrl + '/developers/' + rootScope.currentUser.uuid
      });
    }
    rootScope.loggedIn = !!(rootScope.currentUser);
    return user;
  }

  var service = {
    currentUser: function() {
      var user = rootScope.currentUser;
      if (!user) {
        var cookie = angular.fromJson(cookies['qs_authentication']);
        if (cookie && cookie.info && cookie.info.uuid) {
          user = storeLogin(cookie.info);
        }
      }
      return user;
    },
    logout: function() {
      cookies['qs_authentication'] = angular.toJson({not: 'loggedin'})
      delete cookies['qs_authentication'];
      storeLogin(null);
      var redirectUrl = window.location.protocol + '//' + window.location.host;
      window.location.href = window.qs.ENV['QS_AUTH_BACKEND_URL'] + '/signout?redirect_uri=' + encodeURI(redirectUrl);
    }
  };

  http.setUserService(service);

  return service;
}]);

services.factory('devcenterClient', ['user','qs_http', function(user, http) {
  var devcenterBackendUrl = getDevcenterBackendUrl();
  var lastUpload = null;
  var windowProxy = new Porthole.WindowProxy(window.location.href.replace(/\/\/([^\/]*).*$/, '/$1/partials/games/flash/upload_done.html'));
  windowProxy.addEventListener(function(e) {
    lastUpload = e.data.url;
  });
  Porthole.WindowProxyDispatcher.start();

  http.setUserService(user);

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
      if (gameDetails.configuration.type == 'flash' && lastUpload !== null) {
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
    },

    enableVenue: function(game, venue) {
      var venues = game.venues;
      if (!venues[venue]) {
        venues[venue] = {};
      }
      venues[venue].enabled = true;

      return http.makeRequest({
        method: 'PUT',
        url: devcenterBackendUrl + '/games/' + game.uuid,
        body: {venues: venues},
        returns: function(data) {
          return data;
        }
      });
    },

    disableVenue: function(game, venue) {
      var venues = game.venues;
      if (!venues[venue]) {
        venues[venue] = {};
      }
      venues[venue].enabled = false;

      return http.makeRequest({
        method: 'PUT',
        url: devcenterBackendUrl + '/games/' + game.uuid,
        body: {venues: venues},
        returns: function(data) {
          return data;
        }
      });
    }
  };
}]);
