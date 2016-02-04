'use strict';

angular.module('bookingApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'app/dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        authenticate: true
      })
      .state('add-hub', {
        url: '/add-hub',
        templateUrl: 'app/dashboard/manage-hub.html',
        controller: 'DashboardCtrl'
      })
      .state('update-hub', {
        url: '/update-hub/:hubID',
        templateUrl: 'app/dashboard/manage-hub.html',
        controller: 'DashboardCtrl'
      });
  });
