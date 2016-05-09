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
            $window
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
        Services2.getWebstores().$promise
        .then(function(data) {
            var result = data.data.webstores;
            result.forEach(function(webstore) {
                $scope.webstores.push({
                    key: webstore.webstore.FirstName.concat(' ', webstore.webstore.LastName), 
                    value: webstore.webstore.UserID
                });
            }) 
        });
    }

    /**
     * Get all vehicles
     * 
     * @return {void}
     */
    $scope.getVehicles = function() {
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
            })
        });
    }

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
        Services2.getEcommercePrices(params).$promise
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
    $scope.savePrices = function(form) {
        if (form.$valid) {
            $rootScope.$emit('startSpin');
            var params = {
                prices: $scope.prices
            };
            Services2.saveEcommercePrice({
                id: $scope.webstore.value
            }, params).$promise
            .then(function(data) {
                $rootScope.$emit('stopSpin');
                alert('Save success'); 
                $scope.getPrices();           
                window.location = '/ondemandPrice';
            })
            .catch(function(err){
                $rootScope.$emit('stopSpin');
                alert('Save failed');
            });
        } else {
            alert('Save failed. Value must be a positive number');
        }
    }

    $scope.getVehicles();
    $scope.getWebstores();
    $scope.getPrices();

  });
