'use strict';

angular.module('adminApp')
    .controller('AdminCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope, 
            Services, 
            Services2,
            moment, 
            lodash, 
            $state, 
            $stateParams,
            $location, 
            $http, 
            $httpParamSerializer,
            $window,
            SweetAlert,
            ngDialog,
            $q
        ) {

    Auth.getCurrentUser().then(function (data) {
        $scope.user = data.profile;
    });

    $scope.temp = {
        userID: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        email: '',
        statusID: '',
        roleID: '',
        referralCode: ''
    };
    $scope.formInValid = {};
    $scope.dataOnModal = {};
    $scope.adminStatus = [{
        key: 'CHOOSE STATUS',
        value: 0
    }];

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;

    $scope.isAdminCreate = false;
    $scope.isAdminEdit = false;

    /**
     * Get all Admin Roles
     * 
     * @return {Object} Promise
     */
    var getAdminRoles = function () {
        $scope.roles = [{
            AdminRoleMasterID: 0,
            Name: 'CHOOSE ROLE'
        }];

        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getAdminRoles().$promise.then(function (result) {
                var roles = lodash.sortBy(result.data, function (i) { 
                    return i.Name.toLowerCase(); 
                });
                $scope.roles = $scope.roles.concat(roles);
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function () {
        $http.get('config/defaultValues.json').success(function (data) {
            $scope.adminStatus = $scope.adminStatus.concat(data.adminStatus);
        });
    };

    getDefaultValues();

    /**
     * Assign role to the chosen item while page
     * 
     * @return {void}
     */
    $scope.chooseRole = function (item) {
        $scope.temp.roleID = item.AdminRoleMasterID;
        $scope.temp.role = item;
    }

    /**
     * Assign status to the chosen item while page
     * 
     * @return {void}
     */
    $scope.chooseStatus = function (item) {
        $scope.temp.statusID = item.value;
        $scope.temp.status = item;
    }

    /**
     * Hide add admin page
     * 
     * @return {void}
     */
    $scope.cancelAddOrUpdate = function () {
        $scope.isAdminCreate = false;
        $scope.isAdminEdit = false;
    }

    /** 
     * Reset Temp Data
     *
     */
    $scope.resetTemp = function() {
        $scope.temp = {
            userID: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            email: '',
            statusID: '',
            roleID: ''
        };
    }

    /**
     * Open add admin page
     * 
     * @return {void}
     */
    $scope.addAdmin = function () {
        $scope.resetTemp();
        $scope.formInValid = {};
        $scope.temp.role = $scope.roles[0];
        $scope.temp.status = $scope.adminStatus[0];
        $scope.isAdminCreate = !$scope.isAdminCreate;
    }

    /**
     * Redirect to edit admin page
     * 
     * @return {void}
     */
    $scope.editAdmin = function (admin) {
        $scope.cancelAddOrUpdate();
        $scope.isAdminEdit = true;
        $scope.resetTemp();
        $scope.formInValid = {};
        var roleID = (admin.AdminDetail) ? admin.AdminDetail.RoleID : 0;
        $scope.temp = {
            userID: admin.UserID,
            firstName: admin.FirstName,
            lastName: admin.LastName,
            phoneNumber: parseInt(admin.PhoneNumber),
            password: '',
            confirmPassword: '',
            email: admin.Email,
            statusID: admin.StatusID,
            roleID: roleID
        };

        $scope.temp.role = lodash.find($scope.roles, {AdminRoleMasterID: roleID});
        $scope.temp.status = lodash.find($scope.adminStatus, {value: admin.StatusID});
    }

    /**
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function () {
        $window.history.back();
    } 

    var formValidation = function (type) {
        var isValid = false;
        $scope.formInValid = {};

        if ($scope.temp.password || type === 'create') {
            if (!$scope.temp.confirmPassword) {
                $scope.formInValid.password = "please confirm password";
            }
            if ($scope.temp.confirmPassword && ($scope.temp.password !== $scope.temp.confirmPassword)) {
                $scope.formInValid.password = "password miss match";
            }
        }

        if (!$scope.temp.email) {
            $scope.formInValid.email = "email required";
        }

        if (!$scope.temp.statusID) {
            $scope.formInValid.status = "please choose status";
        }

        if (!$scope.temp.roleID) {
            $scope.formInValid.role = "please choose role";
        }

        if (lodash.isEmpty($scope.formInValid)) {
            isValid = true;
        }

        return isValid;
    }

    var updateAdmin = function (callback) {
        var admin = $scope.temp;

        $rootScope.$emit('startSpin');
        Services2.updateAdmin({
            id: admin.userID
        }, admin).$promise.then(function (response, error) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response);
            } else {
                return callback(error);
            }
        })
        .catch(function (err) {
            $rootScope.$emit('stopSpin');
            return callback(err);
        });
    }

    /**
     * Update single admin
     * 
     * @return {void}
     */
    $scope.updateAdmin = function () {
        if (!formValidation('update')) {
            return;
        }

        updateAdmin(function (err, admin) {
            if (err) {
                SweetAlert.swal('Error', err.data.error.message, 'error');
            } else {
                SweetAlert.swal(
                    'Success',
                    'admin with email: "' + $scope.temp.email + '" has been successfully updated.',
                    'success'
                );
                $scope.getAdminList();
            } 
        });
    }

    var createAdmin = function (callback) {
        var admin = $scope.temp;

        $rootScope.$emit('startSpin');
        Services2.createAdmin({}, admin).$promise.then(function (response, error) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response);
            } else {
                return callback(error);
            }
        })
        .catch(function (err) {
            $rootScope.$emit('stopSpin');
            return callback(err);
        });
    }

    /**
     * Create single admin
     * 
     * @return {void}
     */
    $scope.createAdmin = function () {
        if (!formValidation('create')) {
            return;
        }

        createAdmin(function (err, admin) {
            if (err) {
                SweetAlert.swal('Error', err.data.error.message, 'error');
            } else {
                SweetAlert.swal(
                    'Success',
                    'admin with email: "' + $scope.temp.email + '" has been successfully created.',
                    'success'
                );
                $scope.cancelAddOrUpdate();
                $scope.resetTemp();
                $scope.getAdminList();
            } 
        });
    }

    /**
     * Get all admin
     * 
     * @return {void}
     */
    $scope.getAdminList = function () {
        $rootScope.$emit('startSpin');

        $location.search('offset', $scope.offset);
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage
        };
        Services2.getAdminList(params).$promise.then(function (data) {
            $scope.displayed = data.data.rows;
            $scope.displayed.forEach(function (object){
                object.Role = (object.AdminDetail) ? (lodash.find($scope.roles, {AdminRoleMasterID: object.AdminDetail.RoleID})).Name : '';
                object.Status = (lodash.find($scope.adminStatus, {value: object.StatusID})).key;
            })
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $scope.adminFound = data.data.count;
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.closeModal = function () {
        ngDialog.close();
    }

    $scope.referralCodeModal = function (admin) {
        $scope.dataOnModal.userID = admin.UserID;
        $scope.temp.referralCode = admin.ReferralCode;
        ngDialog.open({
            template: 'modalReferralCode',
            scope: $scope,
            className: 'ngdialog-theme-default',
            closeByDocument: false
        });
    }

    $scope.updateRefferalCode = function () {
        $rootScope.$emit('startSpin');
        var params = {};
            params.userID = $scope.dataOnModal.userID;
            params.referralCode = $scope.temp.referralCode;

        Services2.updateUserReferralCode(params).$promise
        .then(function (data) {
            $scope.closeModal();
            $rootScope.$emit('stopSpin');
        })
        .catch(function(err) {
            $scope.closeModal();
            SweetAlert.swal('Error', err.data.error.message, 'error');
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.export = function () {
        var type = 'userReferral';
        var maxExport = 0;
        var params = {};
            params.limit = 1;
            params.userType = 2;

        Services2.exportReferral(params).$promise
        .then(function (data) {
            maxExport = data.data.count;
            var mandatoryUrl = 'exportType=' + type + '&' + 'maxExport=' + maxExport;
            var params = {};
                params.userType = 2;
            $window.open('/export?' + mandatoryUrl + '&' + $httpParamSerializer(params));
        });
    }

    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function (state) {
        $scope.tableState = state;
        if ($scope.isFirstLoaded) {
            $scope.tableState.pagination.start = $scope.offset;
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        getAdminRoles().then($scope.getAdminList);
    }
    
  });
