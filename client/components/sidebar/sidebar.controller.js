'use strict';

angular.module('adminApp')
    .controller('SidebarCtrl', function($scope, $location, $rootScope, usSpinnerService, localStorageService) {

        $scope.menus = {
            pricing: {
                submenus: {
                    logistic: { routes: ['/pricing/logistic']},
                    ecommerce: { route: ['/pricing/ecommerce']},
                }
            },
            location: {
                submenus: {
                    district: { routes: ['/district']},
                    cities: { routes: ['/cities'] }
                }
            },
            trip: {
                routes: ['/trips']
            },
            hubs: {
                routes: ['/hubs']
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
                if (route === $location.path()) { 
                    active = true; 
                }
            });
            return active;
        };

        Object.keys($scope.menus).forEach(function(menu) {
            if (menu.submenus) {
                Object.keys(menu.submenus).forEach(function(submenu) {
                    if (submenu.routes && routeActive(submenu.routes)) {
                        submenu.active = true;
                        menu.active = true;
                    }
                });
            } else {
                if (menu.routes && routeActive(menu.routes)) {
                    menu.active = true;
                }
            }
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
            $scope.menus[menu].active = !$scope.menus[menu].active;
        }

        $(document).ready(function() {
            // $('.have-sub').click(function () {
            //     var data = $(this).data('dropdown');
            //     $("[id-dropdown='" + data + "']").toggleClass('hidden');
            //     $("[caret-dropdown='" + data + "']").toggleClass('fa-caret-up');
            // });
        });
    });
