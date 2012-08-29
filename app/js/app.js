'use strict';


// Declare app level module which depends on filters, and services
angular.module('devcenterTest', ['devcenterTest.filters', 'devcenterTest.services', 'devcenterTest.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/frontpage.html'});
    $routeProvider.when('/enroll', {templateUrl: 'partials/enroll.html'});
    $routeProvider.when('/login', {templateUrl: 'partials/login.html'});
    $routeProvider.when('/signup', {templateUrl: 'partials/signup.html'});
    $routeProvider.when('/games', {templateUrl: 'partials/games/index.html'});
    $routeProvider.when('/games/new', {templateUrl: 'partials/games/new.html'});
    $routeProvider.when('/games/:gameUuid', {templateUrl: 'partials/games/edit.html', controller: 'GamesCtrl'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
