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

    $scope.displayed = [];

    var oldFees = [];

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
        getFees();
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
                var companies = lodash.sortBy(result.data.Companies, function (i) { 
                    return i.CompanyName.toLowerCase(); 
                });
                $scope.companies = $scope.companies.concat(companies);
                $scope.companies.forEach(function(company) {
                    if (typeof company.FleetManagerID === 'undefined' && company.User) {
                        company.FleetManagerID = company.User.UserID;
                    }
                });
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get all vehicle
     * @return {[type]} [description]
     */
    var getVehicles = function () {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getVehicles().$promise.then(function (result) {
                $scope.vehicles = result.data.Vehicles;
                $scope.vehicles.forEach(function (val) {
                    $scope.displayed.push({
                        VehicleType: val.Name,
                        VehicleID: val.VehicleID,
                    });
                });
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
        if (typeof $scope.input.company.FleetManagerID === 'undefined') {
            alert('Bad data found. Company does not have user record');
            return;
        }

        $rootScope.$emit('startSpin');
        var params = {
            id: $scope.input.company.FleetManagerID
        };
        var paramsMaster = {
            id: 0
        };
        Services2.getLogisticFees(paramsMaster).$promise.then(function(masterResult) {
            oldFees = [];
            var masterData = masterResult.data.Fees;
            $scope.displayed.forEach(function (val, index, array) {
                var data = lodash.find(masterData, {Vehicle: {VehicleID: val.VehicleID}});
                if (data) {
                    array[index] = data;
                    array[index].VehicleID = data.Vehicle.VehicleID;
                    array[index].VehicleType = data.Vehicle.Name;
                    array[index].isMaster = true;
                    oldFees.push({
                        PricePerKM: data.PricePerKM,
                        MinimumFee: data.MinimumFee,
                        PerItemFee: data.PerItemFee
                    });
                } else {
                    oldFees.push({
                        PricePerKM: val.PricePerKM,
                        MinimumFee: val.MinimumFee,
                        PerItemFee: val.PerItemFee
                    });
                }
            });
            if (params.id !== 0) {
                Services2.getLogisticFees(params).$promise.then(function(result) {
                    var fees = result.data.Fees;
                    fees.forEach(function (fee) {
                        var index = $scope.displayed.findIndex(function (master) {
                            return fee.Vehicle.VehicleID === master.VehicleID;
                        });
                        if (index !== -1) {
                            lodash.assign($scope.displayed[index], fee);
                            $scope.displayed[index].isMaster = false;
                            lodash.assign(oldFees[index], {
                                PricePerKM: fee.PricePerKM,
                                MinimumFee: fee.MinimumFee,
                                PerItemFee: fee.PerItemFee
                            });
                        }
                    });
                    $rootScope.$emit('stopSpin');
                });
            } else {
                $rootScope.$emit('stopSpin');
            }
            
        });
    };

    /**
     * Save fee data
     * @param  {Object} fee - from the form on the table
     * @return 
     */
    $scope.saveLogisticFee = function () {
        $rootScope.$emit('startSpin');
        var changedFees = [];

        $scope.displayed.forEach(function (fee, index) {
            var old = oldFees[index];
            if (fee.PricePerKM !== old.PricePerKM ||
                fee.MinimumFee !== old.MinimumFee ||
                fee.PerItemFee !== old.PerItemFee) {
                changedFees.push(fee);
            }
        });

        var params = {
            _id: $scope.input.company.FleetManagerID,
            fees: changedFees
        };
        Services2.updateMultipleLogisticFees(params).$promise.then(function (result) {
            if (result.data === undefined || result.data.RowsAffected !== changedFees.length) {
                alert('Save Fees failed. Please try again or contact tech support.');
            }
            $rootScope.$emit('stopSpin');
            getFees();
        })
        .catch(function () {
            alert('Save Fees failed. Please try again or contact tech support.');
            $rootScope.$emit('stopSpin');
            getFees();
        });
    };

    getDefaultValues()
        .then(getVehicles)
        .then(getCompanies)
        .then(getFees)
        .catch(function (e) {
            alert('Error occured. Please contact tech support.');
            $rootScope.$emit('stopSpin');
        });
});
