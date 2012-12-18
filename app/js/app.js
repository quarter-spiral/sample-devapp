'use strict';


// Declare app level module which depends on filters, and services
angular.module('devcenterTest', ['ngCookies', 'devcenterTest.filters', 'devcenterTest.services', 'devcenterTest.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/frontpage.html'});
    $routeProvider.when('/games', {templateUrl: 'partials/games/index.html', controller: 'GamesCtrl'});
    $routeProvider.when('/faqs', {templateUrl: 'partials/faqs.html', controller: 'FAQsCtrl'});
    $routeProvider.when('/documentation/:currentSection', {templateUrl: 'partials/documentation/index.html', controller: 'DocumentationCtrl'});
    $routeProvider.when('/games/new', {templateUrl: 'partials/games/new.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid', {templateUrl: 'partials/games/game.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/insights', {templateUrl: 'partials/games/insights.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/venues', {templateUrl: 'partials/games/venues/index.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/venues/facebook', {templateUrl: 'partials/games/venues/facebook.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/builds', {templateUrl: 'partials/games/builds.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/developers', {templateUrl: 'partials/games/developers.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/details', {templateUrl: 'partials/games/details.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/friendbar', {templateUrl: 'partials/games/friendbar', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/screens', {templateUrl: 'partials/games/screens.html', controller: 'GamesCtrl'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
