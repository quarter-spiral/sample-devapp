'use strict';

/* Controllers */


function FrontpageCtrl($scope, $location, user) {
  if (user.currentUser()) {
    $location.path('/games');
  }
  $anchorScroll();
}
FrontpageCtrl.$inject = ['$scope', '$location', 'user'];

function LocalModeCtrl($rootScope, $scope, $location,$route, $timeout, user, devcenterClient) {
  $rootScope.hideFooter = true;
  $rootScope.hideHeader = true;

  var localModeUrl = "https://local-content.quarterspiral.com:12566/local-content";

  if (user.currentUser()) {
    var windowProxy = new Porthole.WindowProxy('*');
    var signalReadyToLocalModeApp = function() {
      windowProxy.post({type: 'mkReady'});
      $timeout(signalReadyToLocalModeApp, 500);
    }
    signalReadyToLocalModeApp()
  }

  $scope.selectLocalModeGame = function(gameUuid) {
    devcenterClient.getGame(gameUuid).then(function(game) {
      $scope.selectedGame = game;
    });
  }

  $scope.inLocalMode = function() {
    return $scope.selectedGame && $scope.selectedGame['developer_configuration'] && $scope.selectedGame['developer_configuration']['local_mode'] && $scope.selectedGame['developer_configuration']['local_mode'][user.currentUser().uuid];
  }

  $scope.turnOnLocalMode = function() {
    if (!$scope.selectedGame['developer_configuration']) {
      $scope.selectedGame['developer_configuration'] = {};
    }

    if (!$scope.selectedGame['developer_configuration']['local_mode']) {
      $scope.selectedGame['developer_configuration']['local_mode'] = {};
    }

    var localModeConfiguration = {};
    angular.copy($scope.selectedGame.configuration, localModeConfiguration);
    localModeConfiguration.url = localModeUrl;
    $scope.selectedGame['developer_configuration']['local_mode'][user.currentUser().uuid] = localModeConfiguration;

    $scope.localModeIsSaving = true;
    devcenterClient.updateGame($scope.selectedGame.uuid, $scope.selectedGame).then(function() {
      $scope.localModeIsSaving = false;
    }, function() {
      alert("Could not save the game. Sorry! Please restart the Local Mode app.");
      $scope.localModeIsSaving = false;
    });
  }

  $scope.turnOffLocalMode = function() {
    if (!$scope.selectedGame['developer_configuration']) {
      $scope.selectedGame['developer_configuration'] = {}
    }

    if (!$scope.selectedGame['developer_configuration']['local_mode']) {
      $scope.selectedGame['developer_configuration']['local_mode'] = {};
    }
    delete $scope.selectedGame['developer_configuration']['local_mode'][user.currentUser().uuid];

    $scope.localModeIsSaving = true;
    devcenterClient.updateGame($scope.selectedGame.uuid, $scope.selectedGame).then(function() {
      $scope.localModeIsSaving = false;
    }, function() {
      alert("Could not save the game. Sorry! Please restart the Local Mode app.");
      $scope.localModeIsSaving = false;
    });
  }
}
LocalModeCtrl.$inject = ['$rootScope', '$scope', '$location','$route', '$timeout', 'user', 'devcenterClient'];


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

function NavigationCtrl($scope, $location, user) {

  $scope.activeNavigation = function() {
    return window.location.hash;
  }

  $scope.navigations = [
    {href: '#/games', label: 'Overview'},
  ];
}
NavigationCtrl.$inject = ['$scope', '$location', 'user'];

function HeaderController($scope, $location) {
  $scope.isActive = function(sectionInQuestion) {
   var section = $location.path().replace(/\/games\/[^\/]+\/?/, '')
   if ((typeof sectionInQuestion) === 'string') {
     sectionInQuestion = new RegExp("^" + sectionInQuestion + "$");
   }
   return section.match(sectionInQuestion);
  }

  $scope.insightsActive = function() {
    return $scope.isActive('insights');
  }

  $scope.filesActive = function() {
    return $scope.isActive('builds') || $scope.isActive('screens');
  }

  $scope.settingsActive = function() {
    return $scope.isActive('details') || $scope.isActive(/^venues(\/.+)?$/) || $scope.isActive('developers') || $scope.isActive('dimensions') || $scope.isActive('friendbar');
  }
}
HeaderController.$inject = ['$scope', '$location']

function GamesCtrl($scope, $location, $route, user, devcenterClient) {

  if (!user.currentUser()) {
    if (!$location.path().match(/^\/documentation\//) && !$location.path().match(/^\/faqs/) && !$location.path().match(/^\/local-mode/)) {
      $location.path('/');
    }
    return;
  }

  $scope.QS_CANVAS_APP_URL = '';

  $scope.venues = [
    {label: 'Facebook', id: 'facebook'},
    //{label: 'Spiral Galaxy', id: 'spiral-galaxy'},
    {label: 'Embedded', id: 'embedded'}
  ];


  if ($route.current) {
    $scope.gameUuid = $route.current.params.gameUuid;
  }

  $scope.initFakeGaphs = function() {
    ltvGraph();
    retentionGraph();
    engagementGraph();
    spendGraph();
    funnelGraph();
    playerLossGraph();
    comparisonGraphs();
  }

  $scope.getGames = function() {
    devcenterClient.getGames(user.currentUser().uuid).then(function(games) {
      $scope.games = games;
    }, function() {
      alert("An error happened retrieving the games");
    });
  }

  $scope.addGame = function(game) {
    game.developers = [user.currentUser().uuid];
    devcenterClient.addGame(game).then(function(savedGame) {
      $location.path('/games/' + savedGame.uuid);
    }, function() {
      alert("Could not save that game. Sorry!");
    });
  }

  $scope.getGame = function(gameUuid) {
    devcenterClient.getGame(gameUuid).then(function(game) {
      game.originalConfiguration = angular.copy(game.configuration)
      game.configuration['fluid-size'] = !!game.configuration['fluid-size']
      $scope.game = game;
    }, function() {
      alert("Could not retrieve game " + gameUuid);
    });
  }

  $scope.updateGame = function(game) {
    devcenterClient.updateGame(game.uuid, game).then(function() {
      $location.path('/games/' + game.uuid + '/venues')
    }, function() {
      alert("Could not save the game. Sorry!");
    });
  }

  $scope.deleteGame = function(gameUuid) {
    devcenterClient.deleteGame(gameUuid).then(function() {
      $location.path('/games');
    }, function() {
      alert("Could not delete game. Sorry!");
    });
  }

  $scope.addDeveloper = function(gameUuid, developer) {
    devcenterClient.addDeveloper(gameUuid, developer).then(function (game) {
      $scope.game = game;
    }, function() {
        alert("Could not add the developer. Sorry!");
    });
  }

  $scope.removeDeveloper = function(gameUuid, developer) {
    devcenterClient.removeDeveloper(gameUuid, developer).then(function (game) {
      $scope.game = game;
    }, function() {
        alert("Could not add the developer. Sorry!");
    });
  }

  $scope.enableVenue = function(gameUuid, venue) {
    devcenterClient.enableVenue(gameUuid, venue).then(function(game) {
      $scope.game = game;
    }, function() {
      alert("Could not enable venue '" + venue + "'!");
    });
  }

  $scope.disableVenue = function(gameUuid, venue) {
    devcenterClient.disableVenue(gameUuid, venue).then(function(game) {
      $scope.game = game;
    }, function() {
      alert("Could not disable venue '" + venue + "'!");
    });
  }

  $scope.removeScreenshot = function(game, screenshot) {
    var index = game.screenshots.indexOf(screenshot);
    if (index >= 0) {
      game.screenshots.splice(index, 1);
    }
    $scope.updateGame(game);
  };

  $scope.addScreenshot = function(game) {
    filepicker.pick(
      {
        mimetypes: ['image/*']
      }, function(fpfile) {
        game.screenshots.push({url: fpfile.url, filename: fpfile.filename})
        $scope.$apply();
        $scope.updateGame(game);
      }
    );
  };

  $scope.addFlashBuild = function(game) {
    filepicker.pick(
      {
        mimetypes: ['application/x-shockwave-flash']
      }, function(fpfile) {
        game.configuration.url = '' + fpfile.url + '?dl=false'
        $scope.$apply();
      }
    );
  };

  $scope.categories = devcenterClient.categories;
}
GamesCtrl.$inject = ['$scope', '$location', '$route', 'user', 'devcenterClient'];

function DimensionsController($scope) {
  $scope.addSize = function() {
    $scope.game.configuration.sizes.push({})
  }
  $scope.removeSize = function(index) {
    $scope.game.configuration.sizes.splice(index, 1)
  }
}
DimensionsController.$inject = ['$scope']
