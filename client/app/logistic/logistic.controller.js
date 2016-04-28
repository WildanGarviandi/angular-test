'use strict';

angular.module('adminApp')
    .controller('LogisticFeeCtrl', 
    function(
        $scope, 
        Auth, 
        $rootScope, 
        Services, 
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

    $scope.ctrl = {
        company:  {
            CompanyName: 'Master',
            FleetManagerID: 0
        }
    };

    $scope.companies = [$scope.ctrl.company];

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
                $scope.masterLogistic = data.masterLogistic;
                $scope.displayed = $scope.masterLogistic;
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
            Services.showCompanies().$promise.then(function(data) {
                $scope.companies = $scope.companies.concat(data.companies);
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
            FleetManagerID: $scope.ctrl.company.FleetManagerID
        };
        Services.showLogisticPrices(params).$promise.then(function(data) {
            $scope.displayed = data.fees;
            $scope.vehicleTypes.forEach(function (vehicle) {
                var index = $scope.displayed.findIndex(function (fee) {
                    return fee.VehicleID === vehicle.VehicleID;
                });
                if (index !== -1) {
                    $scope.displayed[index].VehicleType = vehicle.Name;
                } else {
                    $scope.displayed.push(lodash.find($scope.masterLogistic, {'VehicleID': vehicle.VehicleID}));
                }
            });
            $scope.displayed = lodash.sortBy($scope.displayed, 'VehicleID');
            $rootScope.$emit('stopSpin');
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
            Services.getVehicles().$promise.then(function (data) {
                $scope.vehicleTypes = data.vehicles;
                data.vehicles.forEach(function (vehicle, i) {
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
    $scope.saveLogisticFee = function (fee) {
        $rootScope.$emit('startSpin');
        var params = {
            FleetManagerID: $scope.ctrl.company.FleetManagerID,
            VehicleID: fee.VehicleID,
            PricePerKM: (fee.PricePerKM) ? fee.PricePerKM : 0,
            MinimumFee: (fee.MinimumFee) ? fee.MinimumFee : 0,
            PerItemFee: (fee.PerItemFee) ? fee.PerItemFee : 0
        };
        Services.saveLogisticFee(params).$promise.then(function (data) {
            $rootScope.$emit('stopSpin');
            getFees();
        });
    };

    getDefaultValues().then(function (){
        getCompanies().then(function () {
            getVehicles().then(getFees());
        });
    });   
});
