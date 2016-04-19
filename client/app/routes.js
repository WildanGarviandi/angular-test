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
        .state('manage-zipcodes', {
            url: '/manage-zipcodes/:hubID',
            templateUrl: 'app/hub/manage-zipcodes.html',
            controller: 'HubCtrl',
            authenticate: true
        })
        .state('logistic', {
            url: '/logistic',
            templateUrl: 'app/logistic/logistic.html',
            controller: 'LogisticFeeCtrl',
            authenticate: true
        })
        .state('custpricing', {
            url: '/custpricing',
            templateUrl: 'app/custpricing/custpricing.html',
            controller: 'CustPricingCtrl',
            authenticate: true
        })
        .state('district', {
            url: '/district',
            templateUrl: 'app/district/district.html',
            controller: 'DistrictCtrl',
            authenticate: true
        })
        .state('update-district', {
            url: '/update-district/:districtID',
            templateUrl: 'app/district/manage-district.html',
            controller: 'DistrictCtrl',
            authenticate: true
        })
        .state('add-district', {
            url: '/add-district',
            templateUrl: 'app/district/manage-district.html',
            controller: 'DistrictCtrl',
            authenticate: true
        })
        .state('manage-district-zipcodes', {
            url: '/district/:districtID/zipcodes',
            templateUrl: 'app/district/manage-zipcodes.html',
            controller: 'DistrictCtrl',
            authenticate: true
        })
        .state('webstore', {
            url: '/webstore',
            templateUrl: 'app/webstore/webstore.html',
            controller: 'WebstoreCtrl',
            authenticate: true
        })
        .state('add-webstore', {
            url: '/add-webstore',
            templateUrl: 'app/webstore/manage-webstore.html',
            controller: 'WebstoreCtrl',
            authenticate: true
        })
        .state('update-webstore', {
            url: '/update-webstore/:webstoreID',
            templateUrl: 'app/webstore/manage-webstore.html',
            controller: 'WebstoreCtrl',
            authenticate: true
        })
        .state('map', {
            url: '/map',
            templateUrl: 'app/map/map.html',
            controller: 'MapCtrl',
            authenticate: true
        })
        .state('trip', {
            url: '/trips',
            templateUrl: 'app/trip/trip.html',
            controller: 'TripCtrl',
            authenticate: true
        })
        .state('trip-details', {
            url: '/trip/details/:tripID',
            templateUrl: 'app/trip/trip_details.html',
            controller: 'TripCtrl',
            authenticate: true
        });
    });
