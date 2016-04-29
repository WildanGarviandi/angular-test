'use strict';

angular.module('adminApp')
    .config(function ($stateProvider) {
        $stateProvider
        .state('app', {
            url: '/',
            views: {
                'sidebar': {
                    templateUrl: 'components/sidebar/sidebar.html',
                    
                },
                'content': {
                    templateUrl: 'app/hub/hub.html',
                }
            },
            authenticate: true
        })
        .state('login', {
            url: '/login',
            templateUrl: 'app/account/login/login.html',
            controller: 'LoginCtrl'
        })
        .state('app.hub', {
            url: 'hub',
            views: {
                'content@': {
                    templateUrl: 'app/hub/hub.html',
                    controller: 'HubCtrl',
                }
            },
            authenticate: true
        })
        .state('app.add-hub', {
            url: 'add-hub',
            views: {
                'content@': {
                    templateUrl: 'app/hub/manage-hub.html',
                    controller: 'HubCtrl',
                }
            },
            authenticate: true
        })
        .state('app.update-hub', {
            url: 'update-hub/:hubID',
            views: {
                'content@': {
                    templateUrl: 'app/hub/manage-hub.html',
                    controller: 'HubCtrl',
                }
            },
            authenticate: true
        })
        .state('app.manage-zipcodes', {
            url: 'manage-zipcodes/:hubID',
            views: {
                'content@': {
                    templateUrl: 'app/hub/manage-zipcodes.html',
                    controller: 'HubCtrl',
                }
            },
            authenticate: true
        })
        .state('app.pricing', {
            url: 'pricing',
            views: {
                'content@': {
                    templateUrl: 'app/pricing/pricing.html',
                    controller: 'PricingCtrl',
                }
            },
            authenticate: true
        })
        .state('app.custpricing', {
            url: 'custpricing',
            views: {
                'content@': {
                    templateUrl: 'app/custpricing/custpricing.html',
                    controller: 'CustPricingCtrl',
                }
            },
            authenticate: true
        })
        .state('app.district', {
            url: 'district',
            views: {
                'content@': {
                    templateUrl: 'app/district/district.html',
                    controller: 'DistrictCtrl',
                }
            },
            authenticate: true
        })
        .state('app.update-district', {
            url: 'update-district/:districtID',
            views: {
                'content@': {
                    templateUrl: 'app/district/manage-district.html',
                    controller: 'DistrictCtrl',
                }
            },
            authenticate: true
        })
        .state('app.add-district', {
            url: 'add-district',
            views: {
                'content@': {
                    templateUrl: 'app/district/manage-district.html',
                    controller: 'DistrictCtrl',
                }
            },
            authenticate: true
        })
        .state('app.manage-district-zipcodes', {
            url: 'district/:districtID/zipcodes',
            views: {
                'content@': {
                    templateUrl: 'app/district/manage-zipcodes.html',
                    controller: 'DistrictCtrl',
                }
            },
            authenticate: true
        })
        .state('app.webstore', {
            url: 'webstore',
            views: {
                'content@': {
                    templateUrl: 'app/webstore/webstore.html',
                    controller: 'WebstoreCtrl',
                }
            },
            authenticate: true
        })
        .state('app.add-webstore', {
            url: 'add-webstore',
            views: {
                'content@': {
                    templateUrl: 'app/webstore/manage-webstore.html',
                    controller: 'WebstoreCtrl',
                }
            },
            authenticate: true
        })
        .state('app.update-webstore', {
            url: 'update-webstore/:webstoreID',
            views: {
                'content@': {
                    templateUrl: 'app/webstore/manage-webstore.html',
                    controller: 'WebstoreCtrl',
                }
            },
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
