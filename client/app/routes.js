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
        .state('app.profile', {
            url: 'profile',
            views: {
                'content@': {
                    templateUrl: 'app/account/profile/profile.html',
                    controller: 'ProfileCtrl',
                }
            },
            authenticate: true
        })
        .state('app.dashboard', {
            url: 'dashboard',
            views: {
                'content@': {
                    templateUrl: 'app/dashboard/dashboard.html',
                    controller: 'DashboardCtrl',
                }
            },
            authenticate: true
        })
        .state('app.dashboard-details-total', {
            url: 'dashboard-details-total/:merchantID/:pickupType/:date',
            views: {
                'content@': {
                    templateUrl: 'app/dashboard/dashboard_details.html',
                    controller: 'DashboardCtrl',
                }
            },
            authenticate: true
        })
        .state('app.dashboard-details-remaining', {
            url: 'dashboard-details-remaining/:merchantID/:pickupType/:date',
            views: {
                'content@': {
                    templateUrl: 'app/dashboard/dashboard_details.html',
                    controller: 'DashboardCtrl',
                }
            },
            authenticate: true
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
        .state('app.hubMonitor', {
            url: 'hub-monitor',
            views: {
                'content@': {
                    templateUrl: 'app/hub-monitor/hub-monitor.html',
                    controller: 'HubMonitorCtrl',
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
        .state('app.detail-district', {
            url: 'district/:districtID',
            views: {
                'content@': {
                    templateUrl: 'app/district/detailDistrict.html',
                    controller: 'DistrictCtrl'
                }
            }
        })
        .state('app.operational-district', {
            url: 'operational-district',
            views: {
                'content@': {
                    templateUrl: 'app/operational-district/district.html',
                    controller: 'OperationalDistrictCtrl',
                }
            },
            authenticate: true
        })
        .state('app.update-district', {
            url: 'update-district/:districtID',
            views: {
                'content@': {
                    templateUrl: 'app/operational-district/manage-district.html',
                    controller: 'OperationalDistrictCtrl',
                }
            },
            authenticate: true
        })
        .state('app.add-district', {
            url: 'add-district',
            views: {
                'content@': {
                    templateUrl: 'app/operational-district/manage-district.html',
                    controller: 'OperationalDistrictCtrl',
                }
            },
            authenticate: true
        })
        .state('app.manage-district-zipcodes', {
            url: 'district/:districtID/zipcodes',
            views: {
                'content@': {
                    templateUrl: 'app/operational-district/manage-zipcodes.html',
                    controller: 'OperationalDistrictCtrl',
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
        })
        .state('app.fleet', {
            url: 'fleets',
             views: {
                'content@': {
                    templateUrl: 'app/fleet/fleet.html',
                    controller: 'FleetCtrl',
                }
            },
            authenticate: true
        })
        .state('app.add-fleet', {
            url: 'add-fleet',
             views: {
                'content@': {
                    templateUrl: 'app/fleet/manage-fleet.html',
                    controller: 'FleetCtrl',
                }
            },
            authenticate: true
        })
        .state('app.update-fleet', {
            url: 'update-fleet/:fleetID',
             views: {
                'content@': {
                    templateUrl: 'app/fleet/manage-fleet.html',
                    controller: 'FleetCtrl',
                }
            },
            authenticate: true
        })
        .state('app.driverSchedule', {
            url: 'driverSchedules',
             views: {
                'content@': {
                    templateUrl: 'app/driverSchedule/driverSchedule.html',
                    controller: 'DriverScheduleCtrl',
                }
            },
            authenticate: true
        })
        .state('app.update-driverSchedule', {
            url: 'update-driverSchedule/:driverScheduleID',
             views: {
                'content@': {
                    templateUrl: 'app/driverSchedule/manage-driverSchedule.html',
                    controller: 'DriverScheduleCtrl',
                }
            },
            authenticate: true
        })
        .state('app.ecommercePrice', {
            url: 'ondemandPrice',
            views: {
                'content@': {
                    templateUrl: 'app/ecommercePrice/ecommercePrice.html',
                    controller: 'OndemandPriceCtrl',
                }
            },
            authenticate: true
        })
        .state('app.order', {
            url: 'orders',
             views: {
                'content@': {
                    templateUrl: 'app/order/order.html',
                    controller: 'OrderCtrl',
                }
            },
            authenticate: true
        })
        .state('app.order-details', {
            url: 'order/details/:orderID',
             views: {
                'content@': {
                    templateUrl: 'app/order/order_details.html',
                    controller: 'OrderCtrl',
                }
            },
            authenticate: true
        })
        .state('app.codorder', {
            url: 'codorders',
             views: {
                'content@': {
                    templateUrl: 'app/codorder/codorder.html',
                    controller: 'CODOrderCtrl',
                }
            },
            authenticate: true
        })
        .state('app.codorder-details', {
            url: 'codorder/details/:orderID',
             views: {
                'content@': {
                    templateUrl: 'app/codorder/codorder_details.html',
                    controller: 'CODOrderCtrl',
                }
            },
            authenticate: true
        })
        .state('app.returnedorders', {
            url: 'returned-orders',
            views: {
                'content@': {
                    templateUrl: 'app/returnedorders/returnedorders.html',
                    controller: 'ReturnedOrdersCtrl',
                }
            },
            authenticate: true
        })
        .state('app.returnedorders-details', {
            url: 'returned-orders/details/:orderID',
            views: {
                'content@': {
                    templateUrl: 'app/returnedorders/returnedorders_details.html',
                    controller: 'ReturnedOrdersCtrl',
                }
            },
            authenticate: true
        })
        .state('app.codpayment', {
            url: 'codpayments',
             views: {
                'content@': {
                    templateUrl: 'app/codpayment/codpayment.html',
                    controller: 'CODPaymentCtrl',
                }
            },
            authenticate: true
        })
        .state('app.codpayment-details', {
            url: 'codpayment/details/:paymentID',
             views: {
                'content@': {
                    templateUrl: 'app/codpayment/codpayment_details.html',
                    controller: 'CODPaymentCtrl',
                }
            },
            authenticate: true
        })
        .state('app.codmanual', {
            url: 'codmanuals',
             views: {
                'content@': {
                    templateUrl: 'app/codmanual/codmanual.html',
                    controller: 'CODManualCtrl',
                }
            },
            authenticate: true
        })
        .state('app.codmanual-details', {
            url: 'codmanual/details/:paymentID',
             views: {
                'content@': {
                    templateUrl: 'app/codmanual/codmanual_details.html',
                    controller: 'CODManualCtrl',
                }
            },
            authenticate: true
        })
        .state('app.deliveryDistribution', {
            url: 'deliveryDistribution',
             views: {
                'content@': {
                    templateUrl: 'app/deliveryDistribution/deliveryDistribution.html',
                    controller: 'DeliveryDistributionCtrl',
                }
            },
            authenticate: true
        })
        .state('app.fleetZipcodes', {
            url: 'fleetZipcodes',
             views: {
                'content@': {
                    templateUrl: 'app/fleetZipcode/fleetZipcode.html',
                    controller: 'FleetZipcodeCtrl',
                }
            },
            authenticate: true
        })
        .state('app.admin', {
            url: 'admin',
             views: {
                'content@': {
                    templateUrl: 'app/admin/admin.html',
                    controller: 'AdminCtrl'
                }
            },
            authenticate: true
        })
        .state('app.finance', {
            url: 'finance',
             views: {
                'content@': {
                    templateUrl: 'app/finance/finance.html',
                    controller: 'FinanceCtrl'
                }
            },
            authenticate: true
        })
        .state('app.import', {
            url: 'import',
             views: {
                'content@': {
                    templateUrl: 'app/import/import.html',
                    controller: 'ImportCtrl'
                }
            },
            authenticate: true
        });
    });
