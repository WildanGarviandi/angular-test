'use strict';

angular.module('adminApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $rootScope, config, $window, $cookies, $timeout, $http) {
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
            if( authResult.status.method !== "AUTO"){
                $cookies.put('access_token', authResult['access_token']);
                if (authResult['id_token']) {
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
                        if (err.error.code == 404) {
                            $scope.errors.other = "Your account is not registered. Please contact Tech Support to be registered";
                        }
                        $cookies.remove('token');
                        $cookies.remove('techSupport');
                    });
                } else if (authResult['error']) {
                    $scope.errors.other = authResult['error'];
                    $cookies.remove('token');
                    $cookies.remove('techSupport');
                }
            }
        };
     
        // When callback is received, we need to process authentication.
        $scope.signInCallback = function(authResult) {
            setTimeout(function () {
                $scope.$apply(function() {
                    $scope.processAuth(authResult);
                });
            }, 0);
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
                    $scope.errors.other = err.error.message;
                });
            }
        };
    }

});
