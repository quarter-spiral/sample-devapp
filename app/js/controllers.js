'use strict';

/* Controllers */


function MyCtrl1() {}
MyCtrl1.$inject = [];


function MyCtrl2() {
}
MyCtrl2.$inject = [];

function NavigationCtrl($scope) {
  $scope.activeNavigation = function() {
    return window.location.hash;
  }

  $scope.navigations = [
    {href: '#/', label: 'Home'},
    {href: '#/signup', label: 'Sign Up'}
  ];
}

NavigationCtrl.$inject = ['$scope'];
