'use strict';

angular.module('adminApp')
    .controller('SidebarCtrl', function($scope, $location, $rootScope, usSpinnerService, localStorageService, Notification, config, $cookies) {

        $scope.currentPath = $location.path();
        $scope.menus = {
            pricing: {
                submenus: {
                    logistic: { routes: ['/pricing/logistic']},
                    customerPrice: { routes: ['/pricing/customer']},
                    ecommerce: { routes: ['/pricing/ecommerce']},
                    ondemand: { routes: ['/ondemandPrice']},
                }
            },
            location: {
                submenus: {
                    operational: { routes: ['/operational-district'] },
                    district: { routes: ['/district']},
                    cities: { routes: ['/cities'] }
                }
            },
            trips: {
                routes: ['/trips']
            },
            hubs: {
                submenus: {
                    all: { routes: ['/hub'] },
                    hubmonitor: { routes: ['/hub-monitor'] }
                }
            },
            drivers: {
                routes: ['/drivers']
            },
            fleetZipcodes: {
                routes: ['/fleetZipcodes']
            },
            driverSchedule: {
                routes: ['/driverSchedule']
            },
            webstore: {
                routes: ['/webstore']
            },
            map: {
                routes: ['/map']
            },
            dashboard: {
                routes: ['/dashboard']
            },
            orders: {
                submenus: {
                    all: { routes: ['/orders'] },
                    returnedorders: { routes: ['/returned-orders'] },
                    prebookedorder: { routes: ['/prebooked-order'] },
                    cod: { routes: ['/codorders'] },
                    codpayment: { routes: ['/codpayments'] },
                    codmanual: { routes: ['/codmanuals'] },
                }
            },
            fleets : {
                routes: ['/fleets']
            },
            deliveryDistribution: {
                routes: ['/deliveryDistribution']
            },
            admin: {
                routes: ['/admin']
            },
            finance: {
                routes: ['/finance']
            },
            auditTrail: {
                routes: ['/auditTrail']
            }
        };

        function routeActive(routes) {
            var active = false;
            routes.forEach(function (route) {
                if ($scope.currentPath === route) {
                    active = true; 
                }
            });
            return active;
        };

        $scope.refreshSidebar = function() {
            Object.keys($scope.menus).forEach(function(menu) {
                if ($scope.menus[menu].submenus) {
                    $scope.menus[menu].active = false;
                    $scope.menus[menu].expanded = false;
                    
                    Object.keys($scope.menus[menu].submenus).forEach(function(submenu) {
                        
                        $scope.menus[menu].submenus[submenu].active = false;
                        if ($scope.menus[menu].submenus[submenu].routes 
                            && routeActive($scope.menus[menu].submenus[submenu].routes)
                        ) {
                            $scope.menus[menu].submenus[submenu].active = true;
                            $scope.menus[menu].active = true;
                            $scope.menus[menu].expanded = true;
                        }
                    });
                } else {
                    $scope.menus[menu].active = false;
                    if ($scope.menus[menu].routes && routeActive($scope.menus[menu].routes)) {
                        $scope.menus[menu].active = true;
                    }
                }
            });
        }

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $scope.currentPath = '/' + toState.url;
            console.log($scope.currentPath);
            console.log('sidebar');
            Notification.clearAll();
            $scope.isMenuDisable();
            $scope.refreshSidebar();
        });

        $scope.expanded = localStorageService.get('expanded');
        $scope.toggleExpand = function() {
            if (localStorageService.get('expanded')) {
                localStorageService.set('expanded', false);
                $rootScope.$emit('collapse');
                $scope.expanded = false;
            } else {
                localStorageService.set('expanded', true);
                $rootScope.$emit('expand');
                $scope.expanded = true;
            }
        }

        $scope.toggleExpandMenu = function(menu) {
            $scope.menus[menu].expanded = !$scope.menus[menu].expanded;
        }

        $scope.isMenuDisable = function() {
            Object.keys($scope.menus).forEach(function(menu) {
                $scope.menus[menu].menu = true;

                if ($scope.menus[menu].submenus) {
                    Object.keys($scope.menus[menu].submenus).forEach(function(submenu) {
                        $scope.menus[menu].submenus[submenu].menu = true;
                    });
                }
            });

            $scope.menus.deliveryDistribution.menu = config.features.deliveryDistribution.menu;
            $scope.menus.driverSchedule.menu = config.features.driverSchedule.menu;
            $scope.menus.admin.menu = $cookies.get('techSupport') === 'true';
            $scope.menus.auditTrail.menu = $cookies.get('techSupport') === 'true';

            if ($cookies.get('hubAdmin') === 'true') {
                Object.keys($scope.menus).forEach(function(menu) {
                    $scope.menus[menu].menu = false;
                    if (['orders'].indexOf(menu) >= 0) {
                        $scope.menus[menu].menu = true;
                    }

                    if ($scope.menus[menu].submenus) {
                        Object.keys($scope.menus[menu].submenus).forEach(function(submenu) {
                            $scope.menus[menu].submenus[submenu].menu = false;
                            if (['all', 'returnedorders'].indexOf(submenu) >= 0) {
                                $scope.menus[menu].submenus[submenu].menu = true;
                            }
                        });
                    }
                });
            }
        }

        $scope.isMenuDisable();
        $scope.refreshSidebar();
    });
