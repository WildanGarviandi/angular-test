'use strict';

angular.module('adminApp')
    .controller('LogisticFeeCtrl', 
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
        $q
    ) {

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.input = {};

    $scope.input.company =  {
        CompanyName: 'Master',
        FleetManagerID: 0
    };

    $scope.companies = [$scope.input.company];

    $scope.pickup = {
        key: 'Same Day',
        value: '1'
    };

    $scope.pickupTypes = [];
    $scope.vehicleTypes = [];
    $scope.showing = false;

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        return $q(function (resolve) {
            $http.get('config/defaultValues.json').success(function(data) {
                $scope.pickupTypes = data.pickupTypes;
                $scope.percentage = data.percentage;
                resolve();
            });
        });
    };

    /**
     * Assign company to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseCompany = function() {
        if (!$stateParams.query) {
            getFees();
        }
    };

    /**
     * Get all companies
     * 
     * @return {Object} Promise
     */
    var getCompanies = function() {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getAllCompanies().$promise.then(function(result) {
                $scope.companies = $scope.companies.concat(result.data.Companies);
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get all logistic prices
     * 
     * @return {void}
     */
    var getFees = function() {
        $rootScope.$emit('startSpin');
        var params = {
            id: $scope.input.company.FleetManagerID
        };
        var paramsMaster = {
            id: 0
        };
        Services2.getLogisticFees(paramsMaster).$promise.then(function(masterResult) {
            var masterData = masterResult.data.Fees;
            Services2.getLogisticFees(params).$promise.then(function(result) {
                $scope.displayed = result.data.Fees;
                $scope.vehicleTypes.forEach(function (vehicle) {
                    var index = $scope.displayed.findIndex(function (fee) {
                        return fee.VehicleID === vehicle.VehicleID;
                    });
                    if (index !== -1) {
                        $scope.displayed[index].VehicleType = vehicle.Name;
                    } else {
                        var fromMaster = lodash.find(masterData, {'VehicleID': vehicle.VehicleID});
                        fromMaster.FleetManagerID = $scope.input.company.FleetManagerID;
                        fromMaster.VehicleType = vehicle.Name;
                        $scope.displayed.push(fromMaster);
                    }
                });
                $scope.displayed = lodash.sortBy($scope.displayed, 'VehicleID');
                $rootScope.$emit('stopSpin');
            });
        });
    };

    /**
     * Get all vehicles
     * 
     * @return {Object} Promise
     */
    var getVehicles = function () {
        return $q(function (resolve) {
            $scope.vehicleTypes = [];
            Services2.getVehicles().$promise.then(function (result) {
                $scope.vehicleTypes = result.data.Vehicles;
                result.data.Vehicles.forEach(function (vehicle, i) {
                    $scope.vehicleTypes[i].value = vehicle.Name + ' (' + vehicle.Description + ')';
                });
                resolve();
            });
        });
    };

    /**
     * Save fee data
     * @param  {Object} fee - from the form on the table
     * @return 
     */
    $scope.saveLogisticFee = function () {
        $rootScope.$emit('startSpin');
        var params = {
            fees: $scope.displayed
        };
        Services2.updateLogisticFees(params).$promise.then(function (data) {
            $rootScope.$emit('stopSpin');
            getFees();
        });
    };

    getDefaultValues()
        .then(getCompanies)
        .then(getVehicles)
        .then(getFees);

});
