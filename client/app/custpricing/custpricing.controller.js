'use strict';

angular.module('adminApp')
  .controller('CustPricingCtrl', function($scope, Auth, $rootScope, 
    Services, moment, lodash, $state, $stateParams, $location, $http, $window) {

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
      key: 'Corporate',
      value: '3'
    },];

    $scope.pickup = {
      key: 'Same Day',
      value: '1'
    };

    $scope.choosePickup = function(item) {
      $scope.pickup = item;
      if (!$stateParams.query) {
        $scope.getPrices();
      }
    }

    /**
     * Get all customer prices
     * 
     * @return {void}
     */
    $scope.getPrices = function() {
      $rootScope.$emit('startSpin');
      $scope.prices = []
      var params = {
        PickupType: $scope.pickup.value
      }
      Services.showCustomerPrices(params).$promise.then(function(data) {
        if (data.prices.length === 3) {
          $scope.prices = data.prices
        } else {
          $scope.prices.push({'MaxWeight':3, 'MaxDimension1':30, 'MaxDimension2':20, 
            'MaxDimension3':10, 'Price': data.prices[0] ? data.prices[0].Price : null })
          $scope.prices.push({'MaxWeight':6, 'MaxDimension1':30, 'MaxDimension2':30, 
            'MaxDimension3':15, 'Price': data.prices[1] ? data.prices[1].Price : null})
          $scope.prices.push({'MaxWeight':10, 'MaxDimension1':60, 'MaxDimension2':60, 
            'MaxDimension3':30, 'Price': data.prices[2] ? data.prices[2].Price : null})
        }
        $rootScope.$emit('stopSpin');
      });
    }

    /**
     * Save all changes
     * 
     * @return {void}
     */
    $scope.savePrices = function() {
      console.log($scope.prices)
      var params = {
        PickupType: $scope.pickup.value,
        Prices: $scope.prices
      }
      Services.saveCustomerPrices(params).$promise.then(function(data) {
        alert("Save success")
        $scope.getPrices();
      });
    }


    $scope.getPrices();

  });
