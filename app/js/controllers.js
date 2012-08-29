'use strict';

/* Controllers */


function FrontpageCtrl($scope, $location, user) {
  if (user.currentUser()) {
    $location.path('/games');
  }
}
FrontpageCtrl.$inject = ['$scope', '$location', 'user'];


function UserCtrl($scope, $location, user) {
  $scope.login = function(uuid) {
    if (uuid.match(/^\s*$/)) {
      alert("Please enter a UUID or sign up for a new account.");
    } else {
      user.login(uuid).then(function() {
        $location.path("/");
      }, function() {
        alert("Could not enroll you as a dev. Sorry!");
      });
    }
  };

  $scope.logout = function() {
    user.logout();
    $location.path("/");
  };

  $scope.signup = function() {
    user.login();
    $location.path("/");
  }
}
UserCtrl.$inject = ['$scope', '$location', 'user'];

function NavigationCtrl($scope) {
  $scope.activeNavigation = function() {
    return window.location.hash;
  }

  $scope.navigations = [
    {href: '#/', label: 'Home'},
    {href: '#/enroll', label: 'Enroll'}
  ];
}
NavigationCtrl.$inject = ['$scope'];

function GamesCtrl($scope, $location, $route, user, devcenterClient) {
  if (!user.currentUser()) {
    $location.path('/');
    return;
  }

  $scope.gameUuid = $route.current.params.gameUuid;

  $scope.getGames = function() {
    devcenterClient.listGames(user.currentUser()).then(function(games) {
      $scope.games = [];
      for (var i = 0; i < games.length; i++) {
        devcenterClient.getGame(games[i]).then(function(game) {
          $scope.games.push(game);
        }, function() {
          alert("Error retrieving game " + games[i]);
        });
      }
    }, function() {
      alert("An error happened retrieving the games");
    });
  }

  $scope.addGame = function(game) {
    game.developers = [user.currentUser()];
    devcenterClient.addGame(game).then(function() {
      $location.path('/games');
    }, function() {
      alert("Could not save that game. Sorry!");
    });
  }

  $scope.getGame = function(gameUuid) {
    devcenterClient.getGame(gameUuid).then(function(game) {
      $scope.game = game;
    }, function() {
      alert("Could not retrieve game " + gameUuid);
    });
  }

  $scope.updateGame = function(game) {
    devcenterClient.updateGame(game.uuid, game).then(function() {
      $location.path('/games');
    }, function() {
      alert("Could not save the game. Sorry!");
    });
  }

  $scope.deleteGame = function(gameUuid) {
    devcenterClient.deleteGame(gameUuid).then(function() {
      $route.reload();
    }, function() {
      alert("Could not delete game. Sorry!");
    });
  }

  $scope.addDeveloper = function(gameUuid, developer) {
    devcenterClient.getGame(gameUuid).then(function (game) {
      game.developers.push(developer);
      devcenterClient.updateGame(gameUuid, game).then(function() {
        $route.reload();
      }, function() {
        alert("Could not add the developer. Sorry!");
      });
    }, function() {
      alert("Could not add the developer. Sorry!");
    });
  }

  $scope.removeDeveloper = function(gameUuid, developer) {
    devcenterClient.getGame(gameUuid).then(function (game) {
      var index = game.developers.indexOf(developer);
      if (index > -1) {
        game.developers.splice(index, 1);
      } else {
        alert("" + developer + " is not a developer of this game. Sorry!");
      }
      devcenterClient.updateGame(gameUuid, game).then(function() {
        $route.reload();
      }, function() {
        alert("Could not remove the developer. Sorry!");
      });
    }, function() {
      alert("Could not remove the developer. Sorry!");
    });
  }
}
GamesCtrl.$inject = ['$scope', '$location', '$route', 'user', 'devcenterClient'];
