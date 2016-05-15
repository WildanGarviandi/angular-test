'use strict';

angular.module('adminApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $rootScope) {
    $scope.user = {};
    $scope.errors = {};
    $scope.currentDate = new Date();

    $rootScope.$emit('stopSpin');

    $scope.login = function(form) {
        $scope.submitted = true;

        if (form.$valid) {
            Auth.login({
                username: $scope.user.username,
                password: $scope.user.password
            })
            .then( function() {
                // Logged in, redirect to home
                $rootScope.$emit('startSpin');
                $location.path('/');
            })
            .catch( function(err) {
                console.log(err)
                $scope.errors.other = err.message;
            });
        }
    };

  });
