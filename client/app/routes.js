'use strict';

angular.module('adminApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('hub', {
        url: '/hub',
        templateUrl: 'app/hub/hub.html',
        controller: 'HubCtrl',
        authenticate: true
      })
      .state('add-hub', {
        url: '/add-hub',
        templateUrl: 'app/hub/manage-hub.html',
        controller: 'HubCtrl',
        authenticate: true
      })
      .state('update-hub', {
        url: '/update-hub/:hubID',
        templateUrl: 'app/hub/manage-hub.html',
        controller: 'HubCtrl',
        authenticate: true
      })
  });