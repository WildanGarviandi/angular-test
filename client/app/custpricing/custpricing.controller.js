'use strict';

angular.module('adminApp')
    .controller('CustPricingCtrl', 
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
            $window
    ) {

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.pickupTypes = [{
        key: 'Same Day',
        value: '1'
    }, {
        key: 'Next Day',
        value: '2'
    },  {
        key: 'Corporate on Demand',
        value: '3'
    },];

    $scope.pickup = {
        key: 'Same Day',
        value: '1'
    };

    $scope.webstore = {
        key: 'Master',
        value: '0'
    };

    $scope.webstores = [$scope.webstore]

    $scope.defaultPrices = {
        bike: [],
        van: [],
        smalltruck: [],
        mediumtruck: []
    }

    $scope.percentage = {
        bike: {
            LogisticShare: null,
            OurShare: null,
            DriverShare: null
        },
        van: {
            LogisticShare: null,
            OurShare: null,
            DriverShare: null
        },
        smalltruck: {
            LogisticShare: null,
            OurShare: null,
            DriverShare: null
        },
        mediumtruck: {
            LogisticShare: null,
            OurShare: null,
            DriverShare: null
        }
    }

    /**
     * Change prices based on vehicle's Price, LogisticShare, OurShare or DriverShare
     * 
     * @return {void}
     */
    $scope.changePrices = function(vehicle) {
        $scope.prices[vehicle].forEach(function(price) {
            price.LogisticShare = price.Price * Number($scope.percentage[vehicle].LogisticShare) / 100
            price.OurShare = price.Price * Number($scope.percentage[vehicle].OurShare) / 100
            price.DriverShare = price.Price * Number($scope.percentage[vehicle].DriverShare) / 100
        })
        var sum = Number($scope.percentage[vehicle].LogisticShare) +
            Number($scope.percentage[vehicle].OurShare) +
            Number($scope.percentage[vehicle].DriverShare)
        if (sum > 100) {
            alert('Exceed 100%')
            $scope.percentage[vehicle].LogisticShare = null
            $scope.percentage[vehicle].OurShare = null
            $scope.percentage[vehicle].DriverShare = null
            return false
        }
    }

    /**
     * Get default prices for each vehicle
     * 
     * @return {void}
     */
    $scope.getDefaultPrices = function() {
        $scope.defaultPrices.bike.push({
            VehicleID: 1,
            MaxWeight: 3,
            MaxDimension1: 30,
            MaxDimension2: 20,
            MaxDimension3: 10,
            MaxCBM: 0.1,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.bike.push({
            VehicleID: 1,
            MaxWeight: 6,
            MaxDimension1: 30,
            MaxDimension2: 30,
            MaxDimension3: 15,
            MaxCBM: 0.1,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.bike.push({
            VehicleID: 1,
            MaxWeight: 10,
            MaxDimension1: 60,
            MaxDimension2: 60,
            MaxDimension3: 30,
            MaxCBM: 0.1,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.van.push({
            VehicleID: 2,
            MaxCBM: 1,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.van.push({
            VehicleID: 2,
            MaxCBM: 2,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.smalltruck.push({
            VehicleID: 3,
            MaxCBM: 3,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.smalltruck.push({
            VehicleID: 3,
            MaxCBM: 4,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.smalltruck.push({
            VehicleID: 3,
            MaxCBM: 5,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.mediumtruck.push({
            VehicleID: 4,
            MaxCBM: 7,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.mediumtruck.push({
            VehicleID: 4,
            MaxCBM: 8,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.mediumtruck.push({
            VehicleID: 4,
            MaxCBM: 10,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
        $scope.defaultPrices.mediumtruck.push({
            VehicleID: 4,
            MaxCBM: 11,
            LogisticShare: null,
            OurShare: null,
            DriverShare: null,
            Price: null
        })
    }
    $scope.getDefaultPrices()    

    /**
     * Assign price with default prices
     * 
     * @return {void}
     */
    $scope.assignDefaultPrices = function() {        
        if ($scope.prices.bike.length === 0) {
            $scope.prices.bike = $scope.defaultPrices.bike
        }
        if ($scope.prices.van.length === 0) {
            $scope.prices.van = $scope.defaultPrices.van
        }
        if ($scope.prices.smalltruck.length === 0) {
            $scope.prices.smalltruck = $scope.defaultPrices.smalltruck
        }
        if ($scope.prices.mediumtruck.length === 0) {
            $scope.prices.mediumtruck = $scope.defaultPrices.mediumtruck
        }
    }

    /**
     * Assign price with new prices
     * 
     * @return {void}
     */
    $scope.assignNewPrices = function(price) {
        if (price.VehicleID===1) {
            $scope.prices.bike.push(price);
        }
        if (price.VehicleID===2) {
            $scope.prices.van.push(price);
        }
        if (price.VehicleID===3) {
            $scope.prices.smalltruck.push(price);
        }
        if (price.VehicleID===4) {
            $scope.prices.mediumtruck.push(price);
        }
    }

    /**
     * Assign pickup type to the chosen item
     * 
     * @return {void}
     */
    $scope.choosePickup = function(item) {
        $scope.pickup = item;
        if (!$stateParams.query) {
            $scope.getPrices();
        }
    }

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
        $rootScope.$emit('startSpin');
        Services.showWebstores().$promise.then(function(data) {
            $scope.webstores = $scope.webstores; 
            data.webstores.forEach(function(webstores) {
                $scope.webstores.push({key: webstores.FirstName.concat(' ', webstores.LastName), value: webstores.UserID});
            }) 
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get all customer prices
     * 
     * @return {void}
     */
    $scope.getPrices = function() {
        $rootScope.$emit('startSpin');
        $scope.prices = {
            bike: [],
            van: [],
            smalltruck: [],
            mediumtruck: []
        }
        var params = {
            WebstoreUserID: $scope.webstore.value,
            PickupType: $scope.pickup.value
        }
        Services.showCustomerPrices(params).$promise.then(function(data) {
            data.prices.forEach(function(price) {
                $scope.assignNewPrices(price);
            });
            $scope.assignDefaultPrices();
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Save all changes
     * 
     * @return {void}
     */
    $scope.savePrices = function() {   
        var params = {
            WebstoreUserID: $scope.webstore.value,
            PickupType: $scope.pickup.value,
            Prices: $scope.prices
        }
        Services.saveCustomerPrices(params).$promise.then(function(data) {
            alert('Save success'); 
            $scope.getPrices();           
            window.location = '/custpricing';
        });
    }


    $scope.getWebstores();
    $scope.getPrices();

  });
