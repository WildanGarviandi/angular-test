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
        var params = {
            ProfilePicture: $scope.user.ProfilePicture
        };
        Services2.updateUserProfile(params)
        .$promise.then(function (result) { 
            $rootScope.$emit('stopSpin');
            if (result.data.RowUpdated > 0) {
                alert('Update profile success!');
                $state.reload();
            } else {
                alert('Update profile failed. Please try again');
            }
        });
    };

});