'use strict';


// Declare app level module which depends on filters, and services
angular.module('devcenterTest', ['ngCookies', 'devcenterTest.filters', 'devcenterTest.services', 'devcenterTest.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/frontpage.html'});
    $routeProvider.when('/beta', {templateUrl: 'partials/beta.html'});
    $routeProvider.when('/games', {templateUrl: 'partials/games/index.html', controller: 'GamesCtrl'});
    $routeProvider.when('/local-mode', {templateUrl: 'partials/local-mode/index.html', controller: 'LocalModeCtrl'});
    $routeProvider.when('/games/new', {templateUrl: 'partials/games/new.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid', {templateUrl: 'partials/games/game.html', controller: 'GamesCtrl'});
    //$routeProvider.when('/games/:gameUuid/insights', {templateUrl: 'partials/games/insights.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/venues', {templateUrl: 'partials/games/venues/index.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/venues/facebook', {templateUrl: 'partials/games/venues/facebook.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/venues/embedded', {templateUrl: 'partials/games/venues/embedded.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/builds', {templateUrl: 'partials/games/builds.html', controller: 'GamesCtrl'});
    //$routeProvider.when('/games/:gameUuid/developers', {templateUrl: 'partials/games/developers.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/details', {templateUrl: 'partials/games/details.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/dimensions', {templateUrl: 'partials/games/dimensions.html', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/friendbar', {templateUrl: 'partials/games/friendbar', controller: 'GamesCtrl'});
    $routeProvider.when('/games/:gameUuid/screens', {templateUrl: 'partials/games/screens.html', controller: 'GamesCtrl'});
    $routeProvider.otherwise({redirectTo: '/'});
}]).run(function ($rootScope, $location, $timeout, user) {
    $rootScope.$on('$locationChangeStart', function(e, next, current) {
        if (!(next.match(/#\/beta$/) || current.match(/#\/local-mode$/) || user.currentUser())) {
            e.preventDefault()
            $timeout(function() {
                $location.path('/beta')
            }, 0);
        }
    });
})