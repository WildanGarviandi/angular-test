'use strict';

angular.module('adminApp')
  .controller('UserCtrl', function($scope, $location, Auth, 
    ngDialog, User, $window, $rootScope) {

    $scope.amountTopup = 1000000;

    $scope.dynamicPopover = {
      templateUrl: 'userPopover.html',
    };

    Auth.getCurrentUser().$promise.then(function(data) {
      $scope.user = data.profile;
    });

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    }

    $scope.wallet = function() {
      $rootScope.$emit('startSpin');
      User.profile().$promise.then(function(profile) {
        console.log('profile', profile)
        if (profile && profile.Balance) {
          $scope.profile = profile
          ngDialog.open({
            template: 'walletTemplate',
            scope: $scope,
            className: 'ngdialog-theme-default wallet'
          }); 
        } else {
          $scope.profile = {}
        }
        $rootScope.$emit('stopSpin');
      }).catch(function() {
        $rootScope.$emit('stopSpin');
      });
    }

    $scope.topup = function(amount) {
      console.log('topup amount', amount);
      if (amount <= 0) {
        alert('Please topup more than zero');
        return;
      }
      User.topup({
        amount: amount
      }).$promise.then(function(result) {
        console.log(result)
        ngDialog.close();
        if (result.url) {
          $window.open(result.url);  
        } else {
          $scope.showNotification({
            title: 'Request Top Up Failed',
            message: 'Your Top Up request could not be processed. Please try again'
          })
        }
      });
    }

    $scope.showNotification = function(params) {
      ngDialog.close()
      return ngDialog.open({
        template: 'notificationModal',
        scope: $scope,
        data: {
          notification: params
        }
      });
    }

  });
