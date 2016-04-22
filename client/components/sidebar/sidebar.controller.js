'use strict';

angular.module('adminApp')
    .controller('SidebarCtrl', function($scope, $location, $rootScope, usSpinnerService) {

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

        $(document).ready(function() {
            $('.expand-button').click(function() {
                $('.content').toggleClass('isOpen');
                $('.side-panel').toggleClass('isOpen');
                $('#expand').toggleClass('fa-angle-double-right');
                $("[dropdown-id]").addClass('hidden');
                $("[dropdown-caret]").removeClass('fa-caret-up');
            });
            $('.have-sub').click(function () {
                var data = $(this).data('dropdown');
                $("[dropdown-id='" + data + "']").toggleClass('hidden');
                $("[dropdown-caret='" + data + "']").toggleClass('fa-caret-up');
                $('.content').addClass('isOpen');
                $('.side-panel').addClass('isOpen');
                $('#expand').removeClass('fa-angle-double-right');
            });
        });
    });
