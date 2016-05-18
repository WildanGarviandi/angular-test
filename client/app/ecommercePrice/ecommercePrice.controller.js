'use strict';

angular.module('adminApp')
    .controller('OndemandPriceCtrl', 
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
            $q
    ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.webstore = {
        key: 'Master',
        value: 0
    };

    $scope.webstores = [$scope.webstore];

    $scope.prices = []; 

    /**
     * Assign webstore to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseWebstore = function(item) {
        $scope.webstore = item;
        if (!$stateParams.query) {
            $scope.getPrices();
        }
    }

    /**
     * Get all webstores
     * 
     * @return {void}
     */
    $scope.getWebstores = function() {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getWebstores().$promise
            .then(function(data) {
                var result = data.data.webstores;
                result.forEach(function(webstore) {
                    $scope.webstores.push({
                        key: webstore.webstore.FirstName.concat(' ', webstore.webstore.LastName), 
                        value: webstore.webstore.UserID
                    });
                });
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get all vehicles
     * 
     * @return {void}
     */
    $scope.getVehicles = function() {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getVehicles().$promise
            .then(function(data) { 
                var vehicles = data.data.Vehicles;
                vehicles.forEach(function(object) {
                    $scope.prices.push({
                        Name: object.Name,
                        VehicleID: object.VehicleID,
                        PricePerKM: 0,
                        MinimumFee: 0,
                        PickupType: 3,
                        isMaster: false
                    });
                });
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get all ecommerce prices
     * 
     * @return {void}
     */
    $scope.getPrices = function() {
        if ($scope.webstore.value !== 0) {
            $scope.getMasterPrices()
            .then($scope.getDistancePrices);
        } else {
            $scope.getMasterPrices();            
        }        
    }

    /**
     * Get master prices
     * 
     * @return {void}
     */
    $scope.getMasterPrices = function() {        
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            var params = {
                WebstoreUserID: 0
            };
            Services2.getDistancePrices(params).$promise
            .then(function(data) {
                var result = data.data.Prices;
                result.forEach(function(object) {
                    var price = $scope.prices.filter(function(obj) {
                        return obj.VehicleID === object.Vehicle.VehicleID;
                    }); 
                    price[0].PricePerKM = object.PricePerKM;
                    price[0].MinimumFee = object.MinimumFee;
                    price[0].isMaster = ($scope.webstore.value !== 0) ? true : false;
                });
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    }

    /**
     * Get distance prices
     * 
     * @return {void}
     */
    $scope.getDistancePrices = function() {              
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            var params = {
                WebstoreUserID: $scope.webstore.value
            };
            Services2.getDistancePrices(params).$promise
            .then(function(data) {
                var result = data.data.Prices;
                result.forEach(function(object) {
                    var price = $scope.prices.filter(function(obj) {
                        return obj.VehicleID === object.Vehicle.VehicleID;
                    }); 
                    price[0].PricePerKM = object.PricePerKM;
                    price[0].MinimumFee = object.MinimumFee;
                    price[0].isMaster = false;
                });
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    }

    /**
     * Save price
     * 
     * @return {void}
     */
    $scope.savePrices = function(form) {
        var changedPrices = [];
        for (var i = 0; i < $scope.prices.length; i++) {
            var isPriceChanged = form[$scope.prices[i].Name+'-pricePerKM'].$dirty;
            var isMinimumFeeChanged = form[$scope.prices[i].Name+'-minimumFee'].$dirty;
            var isMasterPrice = $scope.prices[i].isMaster;
            if (isPriceChanged && isMinimumFeeChanged) {
                changedPrices.push($scope.prices[i]);
            } else if (isPriceChanged && !isMinimumFeeChanged) {
                if (!isMasterPrice) {
                    changedPrices.push($scope.prices[i]);
                    delete $scope.prices[i].MinimumFee;
                } else {
                    alert('You\'ve changed PricePerKM for ' + $scope.prices[i].Name + '. Please change its MinimumFee also.');
                    return false;
                }
            } else if (!isPriceChanged && isMinimumFeeChanged) {
                if (!isMasterPrice) {
                    changedPrices.push($scope.prices[i]);
                    delete $scope.prices[i].PricePerKM;
                } else {
                    alert('You\'ve changed MinimumFee for ' + $scope.prices[i].Name + '. Please change its PricePerKM also.');
                    return false;
                }
            }
        }

        if (form.$valid) {
            $rootScope.$emit('startSpin');
            var params = {
                prices: changedPrices
            };
            Services2.saveDistancePrice({
                id: $scope.webstore.value
            }, params).$promise
            .then(function(data) {
                $rootScope.$emit('stopSpin');
                alert('Save success'); 
                $scope.getPrices();
            })
            .catch(function(err){
                $rootScope.$emit('stopSpin');
                alert('Save failed');
            });
        } else {
            alert('Save failed. Value must be a positive number');
        }
    }

    $scope.getVehicles()
    .then($scope.getWebstores)
    .then($scope.getPrices);

  });
