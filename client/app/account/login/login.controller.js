'use strict';

angular.module('adminApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $rootScope, config, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.currentDate = new Date();
    $scope.googleClientId = config.googleClientId;
    $rootScope.$emit('stopSpin');

    // This flag we use to show or hide the button in our HTML.
    $scope.signedIn = false;
 
    // Here we do the authentication processing and error handling.
    // Note that authResult is a JSON object.
    $scope.processAuth = function(authResult) {
        // Do a check if authentication has been successful.
        if(authResult['access_token']) {
            // Successful sign in.
            $scope.signedIn = true;
 
            //     ...
            // Do some work [1].
            //     ...
            $scope.getUserInfo();
            $rootScope.$emit('startSpin');
            $location.path('/');
        } else if(authResult['error']) {
            // Error while signing in.
            $scope.signedIn = false;
 
            // Report error.
        }
    };
 
    // When callback is received, we need to process authentication.
    $scope.signInCallback = function(authResult) {
        $scope.$apply(function() {
            $scope.processAuth(authResult);
        });
    };
 
    window.signInCallback = $scope.signInCallback;


    // Start function in this example only renders the sign in button.
    $scope.start = function() {
        $scope.renderSignInButton();
    };

    // Process user info.
    // userInfo is a JSON object.
    $scope.processUserInfo = function(userInfo) {
        // You can check user info for domain.
        if(userInfo['domain'] == 'mycompanydomain.com') {
            // Hello colleague!
        }
     
        // Or use his email address to send e-mails to his primary e-mail address.
        //sendEMail(userInfo['emails'][0]['value']);
    }
     
    // When callback is received, process user info.
    $scope.userInfoCallback = function(userInfo) {
        $scope.$apply(function() {
            $scope.processUserInfo(userInfo);
        });
    };
     
    // Request user info.
    $scope.getUserInfo = function() {
        gapi.client.request(
            {
                'path':'/plus/v1/people/me',
                'method':'GET',
                'callback': $scope.userInfoCallback
            }
        );
    };

  });
