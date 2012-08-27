'use strict';


// Declare app level module which depends on filters, and services
angular.module('devcenterTest', ['devcenterTest.filters', 'devcenterTest.services', 'devcenterTest.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/frontpage.html', controller: MyCtrl1});
    $routeProvider.when('/signup', {templateUrl: 'partials/signup.html', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
