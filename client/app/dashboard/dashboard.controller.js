'use strict';

angular.module('bookingApp')
  .controller('DashboardCtrl', function($scope, Auth, $rootScope, 
    Order, moment, lodash, $state) {

    Auth.getCurrentUser().$promise.then(function(data) {
      $scope.user = data.profile;
    });

  });
