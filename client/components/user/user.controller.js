'use strict';

angular.module('adminApp')
    .controller('UserCtrl', function(
                                $scope, 
                                $location, 
                                Auth, 
                                ngDialog, 
                                User, 
                                $window, 
                                $rootScope
    ) {
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
