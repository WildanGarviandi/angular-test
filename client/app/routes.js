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
        .state('app.map', {
            url: 'map',
            views: {
                'content@': {
                    templateUrl: 'app/map/map.html',
                    controller: 'MapCtrl',
                }
            },
            authenticate: true
        })
        .state('app.city', {
            url: 'cities',
            views: {
                'content@': {
                    templateUrl: 'app/city/city.html',
                    controller: 'CityCtrl',
                }
            },
            authenticate: true
        })
        .state('app.add-city', {
            url: 'add-city',
            views: {
                'content@': {
                    templateUrl: 'app/city/manage-city.html',
                    controller: 'CityCtrl',
                }
            },
            authenticate: true
        })
        .state('app.update-city', {
            url: 'update-city/:cityID',
            views: {
                'content@': {
                    templateUrl: 'app/city/manage-city.html',
                    controller: 'CityCtrl',
                }
            },
            authenticate: true
        })
        .state('app.trip', {
            url: 'trips',
             views: {
                'content@': {
                    templateUrl: 'app/trip/trip.html',
                    controller: 'TripCtrl',
                }
            },
            authenticate: true
        })
        .state('app.trip-details', {
            url: 'trip/details/:tripID',
             views: {
                'content@': {
                    templateUrl: 'app/trip/trip_details.html',
                    controller: 'TripCtrl',
                }
            },
            authenticate: true
        })
        .state('app.ecommerce-pricing', {
            url: 'pricing/ecommerce',
             views: {
                'content@': {
                    templateUrl: 'app/ecommerce/ecommerce.html',
                    controller: 'EcommercePricingCtrl',
                }
            },
            authenticate: true
        })
        .state('app.logistic-fees', {
            url: 'pricing/logistic',
             views: {
                'content@': {
                    templateUrl: 'app/logistic/logistic.html',
                    controller: 'LogisticFeeCtrl',
                }
            },
            authenticate: true
        })
        .state('app.driver', {
            url: 'drivers',
             views: {
                'content@': {
                    templateUrl: 'app/driver/driver.html',
                    controller: 'DriverCtrl',
                }
            },
            authenticate: true
        })
        .state('app.update-driver', {
            url: 'update-driver/:driverID',
             views: {
                'content@': {
                    templateUrl: 'app/driver/manage-driver.html',
                    controller: 'DriverCtrl',
                }
            },
            authenticate: true
        });
    });
