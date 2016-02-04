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
    });
