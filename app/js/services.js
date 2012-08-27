'use strict';

/* Services */

var devcenterBackendService = angular.module('devcenterTest.services', []);
devcenterBackendService.factory('devcenterClient', ['$http', '$q', function(http, q) {
  var devcenterClient = function(datastoreBackendUrl, graphBackendUrl) {
    return {
      promoteDeveloper: function(uuid) {
        var deferred = q.defer();

        http({method: 'GET', url: '/someUrl'}).
          success(function(data, status, headers, config) {
            deferred.resolve();
          }).
          error(function(data, status, headers, config) {
            deferred.reject(data.error);
          });

        return deferred.promise;
      }
    };
  };
  return devcenterClient;
}]);
