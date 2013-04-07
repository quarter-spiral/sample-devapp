'use strict';

/* Directives */
var showSpinner = function(element) {
  element.attr("disabled", "disabled");
  element.originalText = element.text();
  element.text("Hang on a second…");
  element.addClass("processing-payment");
}

var hideSpinner = function(element) {
  element.removeAttr("disabled");
  element.text(element.originalText);
  element.removeClass("processing-payment");
}

angular.module('devcenterTest.directives', []).directive('markdown', function() {
  var converter = new Showdown.converter();
  return {
      restrict: 'E',
      link: function(scope, element, attrs) {
          var markDown = element.text();
          var htmlText = converter.makeHtml(markDown);
          element.html(htmlText);
      }
  }
}).directive('subscriptionTrigger', function (devcenterClient) {
  return {
    restrict: 'A',
    scope: { game: '=' },
    link: function(scope, element, attrs) {
      element.bind('click', openStripeForm);

      var handlePaymentToken = function(token){
        showSpinner(element);
        devcenterClient.subscribeToGame(scope.game, token.id).then(function() {
          scope.game.subscription = true;
          scope.game.subscription_phasing_out = false;
          hideSpinner(element);
        }, function() {
          alert("ARG! We're super sorry, but we could not establish a subscription. Please get in contact with us at support@quarterspiral.com Thanks!");
          hideSpinner(element);
        })
      };

      function openStripeForm(e) {
        e.preventDefault();

        StripeCheckout.open({
          key:         window.qs.ENV.QS_STRIPE_PUBLISHABLE_KEY,
          address:     false,
          amount:      900,
          name:        'Remove Ads',
          description: 'Publish ' + scope.game.name + ' completely ad free!',
          panelLabel:  'Subscribe for mo /',
          token:       handlePaymentToken
        });

        return false;
      }
    }
  }
}).directive('cancelSubscriptionTrigger', function (devcenterClient) {
  return {
    restrict: 'A',
    scope: { game: '=' },
    link: function(scope, element, attrs) {
      element.bind('click', function() {
        showSpinner(element);
        devcenterClient.cancelGameSubscription(scope.game).then(function() {
          scope.game.subscription_phasing_out = true;
          hideSpinner(element);
        }, function() {
          alert("ARG! We're super sorry, but we could not cancel your subscription. Please get in contact with us at support@quarterspiral.com Thanks!");
          hideSpinner(element);
        })
      });
    }
  }
}).directive('gamePremiumBadge', function() {
  return {
    restrict: 'E',
    scope: { game: '='},
    replace: true,
    templateUrl: '/partials/games/premium_badge.html'
  }
}).directive('rollingImpressionsChart', function($filter) {
    return {
        restrict: 'A',
        scope: {
          game: '='
        },
        link: function(scope, element, attrs) {
          var chartDrawn = false;
          scope.$watch('game.insights', function() {
            if (chartDrawn === false && scope.game !== undefined && scope.game !== null && scope.game.insights !== undefined && scope.game.insights !== null) {
              var chartData = $filter('rollingImpressionsChartData')(scope.game.insights)

              var data = []
              for (var i = 0; i < chartData.length; i++) {
                data.push([i + 1, chartData[i]])
              }
              Flotr.draw(element[0], [data], {
                xaxis: {
                  tickDecimals: 0,
                  tickFormatter: function(x, config) {
                    if (x == 30) {
                      return "Yesterday";
                    }
                    return "T - " + (30 - x);
                  }
                },
                yaxis: {
                  min: 0,
                  tickDecimals: 0
                },
                mouse: {
                  track: true,
                  trackFormatter: function(obj) {
                    return "" + moment().subtract('days', 31 - obj.x).format("MMMM D") + ": " + Math.round(obj.y) + " views";
                  }
                }
              });
              chartDrawn = true;
            }
          });
        }
    };
});;
