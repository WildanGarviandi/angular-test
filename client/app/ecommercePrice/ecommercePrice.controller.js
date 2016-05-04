'use strict';

angular.module('adminApp')
    .controller('EcommercePriceCtrl', 
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

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.webstore = {
        key: 'Master',
        value: '0'
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
                        PickupType: 3
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
        $rootScope.$emit('startSpin');
        var params = {
            WebstoreUserID: $scope.webstore.value
        }
        Services2.getDistancePrices(params).$promise
        .then(function(data) {
            var result = data.data.Prices;
            if (result.length > 0) {
                result.forEach(function(object) {
                    var price = $scope.prices.filter(function(obj) {
                        return obj.VehicleID === object.Vehicle.VehicleID;
                    }); 
                    price[0].PricePerKM = object.PricePerKM
                });
            } else {
                $scope.prices.forEach(function(price){
                    price.PricePerKM = 0;
                });
            }
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Save price
     * 
     * @return {void}
     */
    $scope.savePrices = function() {
        $rootScope.$emit('startSpin');
        var params = {
            prices: $scope.prices
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
    }

    $scope.getVehicles()
    .then($scope.getWebstores)
    .then($scope.getPrices);

  });
