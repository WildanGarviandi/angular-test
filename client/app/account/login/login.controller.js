'use strict';

angular.module('adminApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $rootScope, config, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.currentDate = new Date();
    $scope.loginActive = config.features.login;
    $rootScope.$emit('stopSpin');
    var type = '';

    if ($scope.loginActive.google) {
        type = 'google';
        $scope.googleClientId = config.googleClientId;
        // Here we do the authentication processing and error handling.
        // Note that authResult is a JSON object.
        $scope.processAuth = function(authResult) {
            // Do a check if authentication has been successful.
            if(authResult['id_token']) {
                Auth.login(type, {
                    token: authResult['id_token']
                })
                .then( function() {
                    Auth.getAdminFeatures();
                })
                .then( function(feature) {
                    setTimeout(function () { 
                        // Logged in, redirect to home
                        $rootScope.$emit('startSpin');
                        $location.path('/');
                    }, 100); 
                })
                .catch( function(err) {
                    $scope.errors.other = err.error.message;
                });
            } else if(authResult['error']) {
                $scope.errors.other = authResult['error'];
            }
        };
     
        // When callback is received, we need to process authentication.
        $scope.signInCallback = function(authResult) {
            $scope.$apply(function() {
                $scope.processAuth(authResult);
            });
        };
     
        window.signInCallback = $scope.signInCallback;
    };

    if ($scope.loginActive.form) {
        type = 'form';
        $scope.login = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                Auth.login(type, {
                    username: $scope.user.username,
                    password: $scope.user.password
                })
                .then( function() {
                    Auth.getAdminFeatures();
                })
                .then(function(feature) {
                    setTimeout(function () { 
                        // Logged in, redirect to home
                        $rootScope.$emit('startSpin');
                        $location.path('/');
                    }, 100); 
                })
                .catch( function(err) {
                    console.log(err)
                    $scope.errors.other = err.error.message;
                });
            }
        };
    }

});
