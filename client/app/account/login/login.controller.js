'use strict';

angular.module('adminApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $rootScope, config, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.currentDate = new Date();
    $scope.googleClientId = config.googleClientId;
    $rootScope.$emit('stopSpin');
 
    // Here we do the authentication processing and error handling.
    // Note that authResult is a JSON object.
    $scope.processAuth = function(authResult) {
        // Do a check if authentication has been successful.
        if(authResult['id_token']) {
            Auth.login({
                token: authResult['id_token']
            })
            .then( function() {
                // Logged in, redirect to home
                $rootScope.$emit('startSpin');
                $location.path('/');
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

});
