'use strict';

angular.module('adminApp')
  .controller('LoginCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};
    $scope.currentDate = new Date();

    $scope.login = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            Auth.login({
                username: $scope.user.username,
                password: $scope.user.password
            })
            .then( function() {
                // Logged in, redirect to home
                $location.path('/');
            })
            .catch( function(err) {
                console.log(err)
                $scope.errors.other = err.message;
            });
        }
    };

  });
