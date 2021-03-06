'use strict';

angular.module('adminApp')
    .controller('DeliveryDistributionCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope, 
            Services, 
            Services2,
            moment, 
            lodash, 
            $state, 
            $stateParams,
            $location, 
            $http, 
            $window,
            $timeout,
            ngDialog,
            SweetAlert,
            config,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.isFirstLoaded = true;
    $scope.currency = config.currency + " ";
    $scope.groupBys = [];
    $scope.groupBy = {
        key: "Destination",
        value: "destination"
    };
    $scope.createdDatePicker = {
        startDate: new Date(moment().subtract(1, "months").startOf('day')),
        endDate: new Date()
    };

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
            $scope.groupBys = $scope.groupBys.concat(data.deliveryDistributionGroup);
            $scope.groupBy = $scope.groupBys[0];
        });
    };

    getDefaultValues();

    /**
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function() {
         $window.history.back();
    }

    /**
     * Assign groupBy to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseGroupBy = function(item) {
        $scope.groupBy = item;
    }

    /**
     * Get all delivery distribution
     * 
     * @return {void}
     */
    $scope.getDeliveryDistributions = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        if ($scope.createdDatePicker.endDate) {
            $scope.createdDatePicker.endDate.setHours(23, 59, 59, 0);
        }
        var params = {
            groupBy: $scope.groupBy.value,
            startDate: new Date($scope.createdDatePicker.startDate),
            endDate: new Date($scope.createdDatePicker.endDate),
        };
        Services2.getDeliveryDistributions(params).$promise.then(function(data) {
            $scope.displayed = data.data;
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.search = function() {
        $scope.getDeliveryDistributions();
    }

    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {
        $scope.tableState = state;
        if ($scope.isFirstLoaded) {
            $scope.isFirstLoaded = false;
        }
        $scope.getDeliveryDistributions();
    }

    /**
     * Refresh list with user input request
     * 
     * @return {void}
     */
    $scope.refresh = function(item) {
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getDeliveryDistributions(); 
    }

    /**
     * Clear Filter
     * 
     * @return {void}
     */
    $scope.clearFilter = function(item) {
        $state.reload();
    }

});