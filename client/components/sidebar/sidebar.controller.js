'use strict';

angular.module('adminApp')
    .controller('SidebarCtrl', function($scope, $location, $rootScope, usSpinnerService, localStorageService) {

        $scope.currentPath = $location.path();
        $scope.menus = {
            pricing: {
                submenus: {
                    logistic: { routes: ['/pricing/logistic']},
                    ecommerce: { routes: ['/pricing/ecommerce']},
                    ondemand: { routes: ['/ecommercePrice']},
                }
            },
            location: {
                submenus: {
                    district: { routes: ['/district']},
                    cities: { routes: ['/cities'] }
                }
            },
            trips: {
                routes: ['/trips']
            },
            hub: {
                routes: ['/hub']
            },
            drivers: {
                routes: ['/drivers']
            },
            webstore: {
                routes: ['/webstore']
            },
            map: {
                routes: ['/map']
            }
        };

        function routeActive(routes) {
            var active = false;
            routes.forEach(function (route) {
                if (new RegExp($scope.currentPath, 'i').test(route)) {
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

        $scope.refreshSidebar();
    });
