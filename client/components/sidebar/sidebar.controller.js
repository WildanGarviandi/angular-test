'use strict';

angular.module('adminApp')
    .controller('SidebarCtrl', function($scope, $location, $rootScope, usSpinnerService, localStorageService) {

        $rootScope.$on('startSpin', function() {
            usSpinnerService.spin('spinner-1');
            document.getElementById("spinner-container").setAttribute('class', 'overlay');
        });

        $rootScope.$on('stopSpin', function() {
            usSpinnerService.stop('spinner-1');
            document.getElementById("spinner-container").removeAttribute('class', 'overlay');
        });

        $scope.isActive = function(routes) {
            var active = false;
            routes.forEach(function (route) {
                if (route === $location.path()) { 
                    active = true; 
                }
            });
            return active;
        };

        $scope.isNotActive = function (routes) {
            var hidden = true;
            routes.forEach(function (route) {
                if (route === $location.path()) { 
                    hidden = false; 
                }
            });
            return hidden;
        };

        var toggleExpand = function () {
            $('.content').toggleClass('isOpen');
            $('.sidebar').toggleClass('isOpen');
            $('.side-image').toggleClass('isOpen');
            $('.side-text').toggleClass('isOpen');
            $('.side-caret').toggleClass('isOpen');
            $('#expand').toggleClass('fa-angle-double-right');
            $('.image-caret').toggleClass('hidden');
        };

        $(document).ready(function() {
            if (localStorageService.get('isExpanded') === true) {
                toggleExpand();
            }
            $('.expand-button').click(function() {
                toggleExpand();
                if (localStorageService.get('isExpanded') === true) {
                    localStorageService.set('isExpanded', false);
                } else {
                    localStorageService.set('isExpanded', true);
                }
            });
            $('.have-sub').click(function () {
                var data = $(this).data('dropdown');
                $("[id-dropdown='" + data + "']").toggleClass('hidden');
                $("[caret-dropdown='" + data + "']").toggleClass('fa-caret-up');
            });
        });
    });
