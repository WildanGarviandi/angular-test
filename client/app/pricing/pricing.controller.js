'use strict';

angular.module('adminApp')
    .controller('PricingCtrl', 
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

    $scope.company = {
        key: 'Master',
        value: '0'
    };

    $scope.companies = [$scope.company]

    $scope.pickup = {
        key: 'Same Day',
        value: '1'
    };

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
    };

    /**
     * Change prices based on vehicle's Price, LogisticShare, OurShare or DriverShare
     * 
     * @return {void}
     */
    $scope.changePrices = function(vehicle) {
        $scope.prices[vehicle].forEach(function(price) {
            price.LogisticShare = price.Price * Number($scope.percentage[vehicle].LogisticShare) / 100;
            price.OurShare = price.Price * Number($scope.percentage[vehicle].OurShare) / 100;
            price.DriverShare = price.Price * Number($scope.percentage[vehicle].DriverShare) / 100;
        });
        var sum = Number($scope.percentage[vehicle].LogisticShare) +
            Number($scope.percentage[vehicle].OurShare) +
            Number($scope.percentage[vehicle].DriverShare);
        if (sum > 100) {
            alert('Exceed 100%');
            $scope.percentage[vehicle].LogisticShare = null;
            $scope.percentage[vehicle].OurShare = null;
            $scope.percentage[vehicle].DriverShare = null;
            return false
        }
    };

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    $scope.getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
           $scope.defaultPrices = data.defaultPrices;
           $scope.pickupTypes = data.pickupTypes;
        });
    }
    $scope.getDefaultValues();    

    /**
     * Assign price with default prices
     * 
     * @return {void}
     */
    $scope.assignDefaultPrices = function() {        
        if ($scope.prices.bike.length === 0) {
            $scope.prices.bike = $scope.defaultPrices.bike;
        }
        if ($scope.prices.van.length === 0) {
            $scope.prices.van = $scope.defaultPrices.van;
        }
        if ($scope.prices.smalltruck.length === 0) {
            $scope.prices.smalltruck = $scope.defaultPrices.smalltruck;
        }
        if ($scope.prices.mediumtruck.length === 0) {
            $scope.prices.mediumtruck = $scope.defaultPrices.mediumtruck;
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
     * Assign pickup to the chosen item
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
     * Assign company to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseCompany = function(item) {
        $scope.company = item;
        if (!$stateParams.query) {
            $scope.getPrices();
        }
    }

    /**
     * Get all companies
     * 
     * @return {void}
     */
    $scope.getCompanies = function() {
        $rootScope.$emit('startSpin');
        Services.showCompanies().$promise.then(function(data) {
            $scope.companies = $scope.companies; 
            data.companies.forEach(function(company) {
                $scope.companies.push({key: company.CompanyName, value: company.CompanyDetailID});
            }) 
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get all logistic prices
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
        };
        var params = {
            CompanyDetailID: $scope.company.value,
            PickupType: $scope.pickup.value
        }
        Services.showLogisticPrices(params).$promise.then(function(data) {
            data.prices.forEach(function(price) {
                $scope.assignNewPrices(price);
            });
            $scope.assignDefaultPrices();
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Save all price changes
     *
     * @return {void}
     */
    $scope.savePrices = function() {
        var params = {
            CompanyDetailID: $scope.company.value,
            PickupType: $scope.pickup.value,
            Prices: $scope.prices
        };
        Services.savePrices(params).$promise.then(function(data) {
            alert("Save success");
            $scope.getPrices();
            window.location = '/pricing';
        });
    }


    $scope.getCompanies();
    $scope.getPrices();

  });
