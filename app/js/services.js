'use strict';

/* Services */

var devcenterBackendService = angular.module('devcenterTest.services', []);
devcenterBackendService.factory('devcenterClient', ['$http', '$q', function(http, q) {
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

  var devcenterClient = function(devcenterBackendUrl) {
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

      deleteGame: function(gameUuid) {
        return http.makeRequest({
          method: 'DELETE',
          url: devcenterBackendUrl + '/games/' + gameUuid,
        });
      }
    };
  };
  return devcenterClient;
}]);
