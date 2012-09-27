'use strict';


// Declare app level module which depends on filters, and services
angular.module('devcenterTest', ['ngCookies', 'devcenterTest.filters', 'devcenterTest.services', 'devcenterTest.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/frontpage.html'});
    $routeProvider.when('/login', {templateUrl: 'partials/login.html'});
    $routeProvider.when('/signup', {templateUrl: 'partials/signup.html'});
    $routeProvider.when('/games', {templateUrl: 'partials/games/index.html'});
    $routeProvider.when('/games/new', {templateUrl: 'partials/games/new.html'});
    $routeProvider.when('/games/:gameUuid', {templateUrl: 'partials/games/game.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/venues', {templateUrl: 'partials/games/venues.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/builds', {templateUrl: 'partials/games/builds.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/developers', {templateUrl: 'partials/games/developers.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/details', {templateUrl: 'partials/games/details.html', controller: 'GamesCtrl'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
