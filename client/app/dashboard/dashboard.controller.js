'use strict';

angular.module('adminApp')
.controller('DashboardCtrl', 
    function(
        $scope,
        $location,
        $window,
        Services2,
        Services,
        $rootScope
    ) {

    $scope.chart = {
        colours: ['#37b392', '#FFA500', '#FF5A60', '#CCCCCC'],
        today: {
            data: [0, 0],
            labels: ['Delivered', 'Pending', 'Cancelled']
        },
        week: {
            data: [0, 0],
            labels: ['Delivered', 'Pending', 'Cancelled']
        },
        month: {
            data: [0, 0],
            labels: ['Delivered', 'Pending', 'Cancelled']
        }
    };
});