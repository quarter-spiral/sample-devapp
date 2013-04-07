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

var games = {};
var gamesRequestPromise = null;

services.factory('devcenterClient', ['$q', '$http', 'user','qs_http', function($q, $http, user, http) {
  var devcenterBackendUrl = getDevcenterBackendUrl();

  http.setUserService(user);

  var publicGames = [];
  var categories = [];

  var getGameInsights = function(game) {
    game.insights = null;
    http.makeRequest({
      method: 'GET',
      url: devcenterBackendUrl + '/games/' + game.uuid + '/insights',
      returns: function(data) {
        game.insights = data[game.uuid];
      }
    });
  }

  var getGames = function() {
    if (gamesRequestPromise) {
      return gamesRequestPromise;
    }

    gamesRequestPromise = http.makeRequest({
      method: 'GET',
      url: devcenterBackendUrl + '/developers/' + user.currentUser().uuid + '/games',
      returns: function(data) {
        games = data;
        return data;
      }
    });
    return gamesRequestPromise;
  }

  var listPublicGames = function() {
    $http({method: 'GET', url: devcenterBackendUrl + '/public/games'}).success(function(data, status, headers, config) {
      publicGames.splice(0, publicGames.length)
      var temporaryCategories = {}
      for (var i = 0; i < data.games.length; i++) {
        var game = data.games[i];
        publicGames.push(game);
        temporaryCategories[game.category] = temporaryCategories[game.category] || 0
        temporaryCategories[game.category]++;
      }

      categories.splice(0, categories.length)
      for (var category in temporaryCategories) {
        if (temporaryCategories.hasOwnProperty(category)) {
          categories.push({name: category, count: temporaryCategories[category]})
        }
      }
      return publicGames;
    });
  };
  listPublicGames();

  return {
    publicGames: publicGames,
    categories: categories,

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

    getGames: getGames,

    addGame: function(gameDetails) {
      return http.makeRequest({
        method: 'POST',
        url: devcenterBackendUrl + '/games',
        body: gameDetails,
        returns: function(data) {
          games[data.uuid] = data;
          return data;
        }
      });
    },

    addDeveloper: function(gameUuid, developerUuid) {
      return http.makeRequest({
        method: 'POST',
        url: devcenterBackendUrl + '/games/' + gameUuid + '/developers/' + developerUuid,
        returns: function(data) {
          games[data.uuid] = data;
          return data;
        }
      });
    },

    removeDeveloper: function(gameUuid, developerUuid) {
      return http.makeRequest({
        method: 'DELETE',
        url: devcenterBackendUrl + '/games/' + gameUuid + '/developers/' + developerUuid,
        returns: function(data) {
          games[data.uuid] = data;
          return data;
        }
      });
    },

    deleteGame: function(gameUuid) {
      return http.makeRequest({
        method: 'DELETE',
        url: devcenterBackendUrl + '/games/' + gameUuid,
        returns: function() {
          delete games[gameUuid];
        }
      });
    },

    updateGame: function(gameUuid, gameDetails) {
      gameDetails = angular.fromJson(angular.toJson(gameDetails));
      delete gameDetails.originalConfiguration
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
      var deferred = $q.defer();

      getGames().then(function() {
        var game = games[gameUuid];
        getGameInsights(game);

        deferred.resolve(game);
      });

      return deferred.promise;
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
    },

    subscribeToGame: function(game, stripeToken) {
      return http.makeRequest({
        method: 'POST',
        url: devcenterBackendUrl + '/games/' + game.uuid + '/subscription',
        body: {token: stripeToken}
      });
    },

    cancelGameSubscription: function(game) {
      return http.makeRequest({
        method: 'DELETE',
        url: devcenterBackendUrl + '/games/' + game.uuid + '/subscription'
      });
    }
  };
}]);
