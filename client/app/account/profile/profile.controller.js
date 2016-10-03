'use strict';

angular.module('adminApp')
.controller('ProfileCtrl', function (
    $scope,
    $timeout,
    $rootScope,
    Auth,
    Upload,
    config,
    Services2,
    $state
) {
    $rootScope.$emit('startSpin');
    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
        $scope.user.oldPassword = '';
        $scope.user.newPassword = '';
        $scope.user.confirmPassword = '';
        $rootScope.$emit('stopSpin');
    });

    $scope.uploadPic = function (file) {
        $rootScope.$emit('startSpin');
        if (file) {
            $scope.f = file;
            file.upload = Upload.upload({
                url: config.url + 'upload/picture',
                data: {file: file}
            })
            .then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    if (response.data.data && !response.data.error) {
                        $scope.user.ProfilePicture = response.data.data.Location;
                    } else {
                        alert('Uploading picture failed. Please try again');
                        $scope.errorMsg = 'Uploading picture failed. Please try again';
                    }
                    $rootScope.$emit('stopSpin');
                });
            }, function (response) {
                if (response.status > 0) {
                    $scope.errorMsg = response.status + ': ' + response.data;
                }
                $rootScope.$emit('stopSpin');
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };

    $scope.updateProfile = function () {
        $rootScope.$emit('startSpin');
        var messages = '';
        var params = {
            ProfilePicture: $scope.user.ProfilePicture
        };

        if ($scope.changePass) {
            $scope.submitted = true;

            if (!$scope.user.oldPassword || !$scope.user.newPassword || !$scope.user.confirmPassword || $scope.user.newPassword !== $scope.user.confirmPassword) {
                $rootScope.$emit('stopSpin');
                return;
            }
        }

        Services2.updateUserProfile(params)
        .$promise.then(function (result) {
            $rootScope.$emit('stopSpin');
            if (result.data.RowUpdated > 0) {
                messages = 'Update profile success!';
            } else {
                messages = 'Update profile failed. Please try again';
            }

            if ($scope.changePass) {
                Services2.updateUserPassword({
                    newPassword: $scope.user.newPassword,
                    oldPassword: $scope.user.oldPassword
                })
                .$promise.then(function (changedPass) { 
                    messages = 'Update profile success!';
                    alert(messages);
                })
                .catch(function(err) {
                    messages = 'Update profile failed. Old password wrong. Please try again';
                    alert(messages);
                });
            } else {
                alert(messages);
            }

            $state.reload();
        }).catch(function(err) {
            alert('Update profile failed. Please try again');
        });
    };

});