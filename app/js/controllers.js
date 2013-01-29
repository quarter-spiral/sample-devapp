'use strict';

function redirectToBetaWall($location, user) {
  if (!user.currentUser()) {
    $location.path('/beta');
    return true;
  }
  return false;
}

/* Controllers */


function FrontpageCtrl($scope, $location, user) {
  if (redirectToBetaWall($location, user)) {
    return;
  }

  if (user.currentUser()) {
    $location.path('/games');
  }
}
FrontpageCtrl.$inject = ['$scope', '$location', 'user'];




function FAQsCtrl($scope, $location,$route, user) {
  if (redirectToBetaWall($location, user)) {
    return;
  }

  $scope.faqFilter = "";

  $scope.faqs = [
    {
      question: 'What is Spiral Galaxy',
      showAnswer: false,
      answer: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
      question: 'What is Mission Kontrol',
      showAnswer: false,
      answer: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
      question: 'What does it cost to add my game to QS',
      showAnswer: false,
      answer: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
      question: 'Which platforms does QS support',
      showAnswer: false,
      answer: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
      question: 'How can I remove my game',
      showAnswer: false,
      answer: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    }
  ];
}
FAQsCtrl.$inject = ['$scope', '$location','$route', 'user'];



function DocumentationCtrl($scope, $location,$route, user) {
  if (redirectToBetaWall($location, user)) {
    return;
  }

  if ($route.current) {
    $scope.currentSection = $route.current.params.currentSection;
    $scope.templateURL = 'partials/documentation/'+$scope.currentSection+'.html';
  }

  $scope.sections = [
    {label: 'Overview', id: 'overview'},
    {label: 'Tutorial', id: '', type: 'header'},
    {label: 'Set up a game', id: 'setup'},
    {label: 'Publish to Facebook', id: 'facebook'},
    {label: 'Display player data', id: 'integration'},
    {label: 'Store and retrieve data', id: 'integration2'},
    {label: 'SDK', id: '', type: 'header'},
    {label: 'SDK overview', id: 'sdkIntro'},
    {label: 'Flash SDK', id: 'sdkFlash'},
    {label: 'HTML SDK', id: 'sdkHtml'},
    {label: 'APIs', id: '', type: 'header'},
    {label: 'API overview', id: 'apis'},
    {label: 'Player API', id: 'playerCenter'},
    {label: 'Developer API', id: 'devCenter'}
  ];

  /*
    {label: 'Datastore API', id: 'datastore'},
    {label: 'Graph API', id: 'graph'},
    {label: 'Authentification', id: 'auth'}
  */

}
DocumentationCtrl.$inject = ['$scope', '$location','$route', 'user'];


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
  if (redirectToBetaWall($location, user)) {
    return;
  }

  $scope.activeNavigation = function() {
    return window.location.hash;
  }

  $scope.navigations = [
    {href: '#/games', label: 'Overview'},
  ];
}
NavigationCtrl.$inject = ['$scope', '$location', 'user'];

function GamesCtrl($scope, $location, $route, user, devcenterClient) {
  if (redirectToBetaWall($location, user)) {
    return;
  }

  if (!user.currentUser()) {
    if (!$location.path().match(/^\/documentation\//) && !$location.path().match(/^\/faqs/)) {
      $location.path('/');
    }
    return;
  }

  $scope.currentUrl = $location.path().substr(44, $location.path().length);
  $scope.QS_CANVAS_APP_URL = '';

  $scope.venues = [
    {label: 'Facebook', id: 'facebook'},
    {label: 'Spiral Galaxy', id: 'spiral-galaxy'},
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
    devcenterClient.listGames(user.currentUser().uuid).then(function(games) {
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
    game.developers = [user.currentUser().uuid];
    devcenterClient.addGame(game).then(function(savedGame) {
      $location.path('/games/' + savedGame.uuid);
    }, function() {
      alert("Could not save that game. Sorry!");
    });
  }

  $scope.getGame = function(gameUuid) {
    devcenterClient.getGame(gameUuid).then(function(game) {
      game.originalConfiguration = angular.fromJson(angular.toJson(game.configuration))
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
      $route.reload();
    }, function() {
        alert("Could not add the developer. Sorry!");
    });
  }

  $scope.removeDeveloper = function(gameUuid, developer) {
    devcenterClient.removeDeveloper(gameUuid, developer).then(function (game) {
      $route.reload();
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

}
GamesCtrl.$inject = ['$scope', '$location', '$route', 'user', 'devcenterClient'];

