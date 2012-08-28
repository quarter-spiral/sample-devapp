'use strict';

/* Services */

var devcenterBackendService = angular.module('devcenterTest.services', []);
devcenterBackendService.factory('devcenterClient', ['$http', '$q', function(http, q) {
  http.makeRequest = function(options) {
    var method = options.method;
    var url = options.url;
    var deferred = q.defer();

    http({method: method, url: url}).
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
      }
    };
  };
  return devcenterClient;
}]);
