'use strict';

angular.module('adminApp')
    .controller('DashboardCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope, 
            Services, 
            Services2,
            Webstores,
            moment, 
            lodash, 
            $state, 
            $stateParams,
            $location, 
            $http, 
            $httpParamSerializer,
            $window,
            $q,
            config,
            Upload,
            $timeout,
            $filter,
            ngDialog,
            SweetAlert
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.datePickerOptions = {
        'showWeeks': false,
        'formatDay': 'd'
    };

    $scope.temp = {};
    $scope.temp.show = {};
    $scope.temp.chart = {};
    $scope.temp.table = {};

    $scope.startFilter = $location.search().startFilter || null;
    $scope.endFilter = $location.search().endFilter || null;

    $scope.dashboardFeatures = [
        {
            key: 'Choose dashboard feature ...',
            value: 0
        }, {
            key: 'New Merchant',
            value: 1
        }, {
            key: 'Total Order',
            value: 2
        }, {
            key: 'Top Merchant Location',
            value: 3
        }, {
            key: 'Top Active Merchant',
            value: 4
        }, {
            key: 'Inactive Merchant',
            value: 5
        }, {
            key: 'Revenue',
            value: 6
        }
    ];
    $scope.dashboardFeature = $scope.dashboardFeatures[0];

    $scope.chooseDashboardFeature = function (feature) {
        $scope.dashboardFeature = feature;
        $scope.temp.show.filter = false;
        $scope.temp.show.table = false;
        $scope.temp.show.chart = false;
        if (feature.value) {
            if ([1, 2, 6].indexOf(feature.value) !== -1) {
                $scope.temp.show.filter = true;
            } else {
                $scope.filter();
            }
        }
    }

    $scope.filter = function () {
        $rootScope.$emit('startSpin');
        var type = $scope.dashboardFeature.value;
        switch (type) {
            case 1:
                getNewMerchant();
                break;
            case 2:
                getTotalOrder();
                break;
            case 3:
                getTopMerchantLocation();
                break;
            case 4:
                getTopActiveMerchant();
                break;
            case 5:
                getInactiveMerchant();
                break;
            case 6:
                getRevenue();
                break;
        }
    }

    var createLineChart = function (label, data) {
        $scope.temp.chart = {};
        $scope.temp.chart.colors = ['#ff5b60'];
        $scope.temp.chart.labels = label ? label : [];
        $scope.temp.chart.data = data ? [data] : [[]];
        $scope.temp.chart.settings = [{
            label: "Line chart",
            borderWidth: 3,
            type: 'line',
            fill: false
        }];
    };

    var getNewMerchant = function () {
        var params = {};
            params.startDate = $scope.startFilter;
            params.endDate = $scope.endFilter;
        Services2.getDailyNewMerchants(params).$promise
        .then(function (res) {
            var data = [];
            var labels = [];
            var total = 0;
            angular.forEach(res.data.rows, function (val) {
                data.push(val.count);
                labels.push(moment(val.date).format('DD-MM-YYYY'));
                total += val.count;
            });
            createLineChart(labels, data);
            $rootScope.$emit('stopSpin');
            $scope.temp.show.chart = true;
            $scope.temp.total = total;
        });
    }

    var getTotalOrder = function () {
        var params = {};
            params.startDate = $scope.startFilter;
            params.endDate = $scope.endFilter;
        Services2.getDailyTotalOrders(params).$promise
        .then(function (res) {
            var data = [];
            var labels = [];
            var total = 0;
            angular.forEach(res.data.rows, function (val) {
                data.push(val.count);
                labels.push(moment(val.date).format('DD-MM-YYYY'));
                total += val.count;
            });
            createLineChart(labels, data);
            $rootScope.$emit('stopSpin');
            $scope.temp.show.chart = true;
            $scope.temp.total = total;
        });
    }

    var getTopMerchantLocation = function () {
        var params = {};
        Services2.getTopLocationOrder(params).$promise
        .then(function (res) {
            $scope.temp.table.head = [
                {
                    key: 'City',
                    value: 'City'
                }, {
                    key: 'TotalOrder',
                    value: 'Total Order'
                }
            ];
            $scope.temp.table.data = res.data;
            $rootScope.$emit('stopSpin');
            $scope.temp.show.table = true;
        });
    }

    var getTopActiveMerchant = function () {
        var params = {};
        Services2.getTopActiveMerchant(params).$promise
        .then(function (res) {
            $scope.temp.table.head = [
                {
                    key: 'Merchant',
                    value: 'Merchant'
                }, {
                    key: 'TotalOrderCounted',
                    value: 'Total Order'
                }
            ];
            $scope.temp.table.data = res.data;
            $rootScope.$emit('stopSpin');
            $scope.temp.show.table = true;
        });
    }

    var getInactiveMerchant = function () {
        var params = {};
        Services2.getTopInactiveMerchant(params).$promise
        .then(function (res) {
            $scope.temp.table.head = [
                {
                    key: 'Merchant',
                    value: 'Merchant'
                }, {
                    key: 'TotalOrderString',
                    value: 'Total Order'
                }
            ];

            var data = [];
            angular.forEach(res.data, function (val) {
                val.TotalOrderString = 0;
                data.push(val);
            });
            $scope.temp.table.data = data;
            $rootScope.$emit('stopSpin');
            $scope.temp.show.table = true;
        });
    }

    var getRevenue = function () {
        var params = {};
            params.startDate = $scope.startFilter;
            params.endDate = $scope.endFilter;
        Services2.getDailyTotalRevenue(params).$promise
        .then(function (res) {
            var data = [];
            var labels = [];
            var total = 0;
            angular.forEach(res.data, function (val) {
                data.push(val.TotalDeliveryFee);
                labels.push(moment(val.Date).format('DD-MM-YYYY'));
                total += val.TotalDeliveryFee;
            });
            createLineChart(labels, data);
            $rootScope.$emit('stopSpin');
            $scope.temp.show.chart = true;
            $scope.temp.total = config.currency + ' ' + $filter('number')(total);
        });
    }
});
