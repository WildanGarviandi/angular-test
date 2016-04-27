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

        $scope.isActive = function(route) {
            return route === $location.path();
        };

        var toggleExpand = function () {
            $('.container-hubs').toggleClass('isOpen');
            $('.side-panel').toggleClass('isOpen');
            $('#expand').toggleClass('fa-angle-double-right');
            $('.image-caret').toggleClass('hidden');
        };

        if (localStorageService.get('isExpanded') === true) {
            toggleExpand();
        }

        $(document).ready(function() {
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
                $("[dropdown-id='" + data + "']").toggleClass('hidden');
                $("[dropdown-caret='" + data + "']").toggleClass('fa-caret-up');
            });
        });
    });
