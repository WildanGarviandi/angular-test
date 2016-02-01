'use strict';

angular.module('bookingApp')
  .controller('SidebarCtrl', function($scope, $location, $rootScope, usSpinnerService) {

    $rootScope.$on('startSpin', function() {
      console.log('::startSpin');
      usSpinnerService.spin('spinner-1');
      document.getElementById("spinner-container").setAttribute('class', 'overlay');
    });

    $rootScope.$on('stopSpin', function() {
      console.log('::stopSpin');
      usSpinnerService.stop('spinner-1');
      document.getElementById("spinner-container").removeAttribute('class', 'overlay');
    });

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
