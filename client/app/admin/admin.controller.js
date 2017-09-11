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
        referralCode: '',
        filter: {}
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

    var tableFilterSearch = ['name', 'email', 'phoneNumber'];
    var tableFilterSelect = [
        {
            key: 'statusID',
            collection: 'adminStatus',
            scope: 'status',
            value: 'value'
        }, {
            key: 'AdminRoleMasterID',
            collection: 'roles',
            scope: 'role',
            value: 'AdminRoleMasterID'
        }
    ];

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
            roleID: '',
            filter: {}
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
        $window.scrollTo(0, 0);
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

    $scope.selectFilter = function (name, item) {
        lodash.each(tableFilterSelect, function (val) {
            if (name == val.scope) {
                $scope.temp.filter[val.key] = item[val.value];
                $location.search(val.key, $scope.temp.filter[val.key]);
                $scope[val.scope] = item;
            }
        });
    }

    $scope.searchList = function () {
        tableFilterSearch.forEach(function (val) {
            $location.search(val, $scope.temp.filter[val]);
        });
        $scope.getAdminList();
    }

    $scope.resetFilter = function () {
        tableFilterSearch.forEach(function (val) {
            $location.search(val, null);
            $scope.temp.filter[val] = '';
        });
        tableFilterSelect.forEach(function (val) {
            $location.search(val.key, null);
            $scope.temp.filter[val.key] = '';
        });
        $scope.offset = 0;
        $scope.getAdminList();
    }

    var getAdminListParam = function () {
        var param = {};
        $location.search('offset', $scope.offset);

        lodash.each(tableFilterSearch, function (val) {
            $scope.temp.filter[val] = $location.search()[val] || $scope.temp.filter[val];
        });
        lodash.each(tableFilterSelect, function (val) {
            var value = $location.search()[val.key] || $scope.temp.filter[val.key];
            var findObject = {};
                findObject[val.value] = (parseInt(value)) ? parseInt(value) : value;

            $scope.temp.filter[val.key] = value;
            $scope.temp.filter[val.scope] = lodash.find($scope[val.collection], findObject);
        });

        param.offset = $scope.offset;
        param.limit = $scope.itemsByPage;
        param.name = $scope.temp.filter.name;
        param.email = $scope.temp.filter.email;
        param.phoneNumber = $scope.temp.filter.phoneNumber;
        param.statusID = $scope.temp.filter.statusID;
        param.roleID = $scope.temp.filter.AdminRoleMasterID;

        return param;
    }

    /**
     * Get all admin
     * 
     * @return {void}
     */
    $scope.getAdminList = function () {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;

        var params = getAdminListParam();
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
            $scope.getAdminList();
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

    function getAdminDetail () {
        $rootScope.$emit('startSpin');
        $scope.id = $stateParams.userID;
        Services2.getAdminDetail({userID: $scope.id}).$promise
        .then(function (data) {
            $scope.admin = data.data;
            $scope.admin.Status = (lodash.find($scope.adminStatus, {value: data.data.StatusID})).key;
            if (data.data.AdminDetail && (data.data.AdminDetail.RoleID == 3 || data.data.AdminDetail.RoleID == 5)) {
                getHubUser(function (hub) {
                    $scope.admin.hubUsers = [];
                    $scope.admin.canAccessAdmin = (data.data.AdminDetail.RoleID == 5);
                    $scope.temp.param = {};
                    $scope.temp.param.canAccessAdmin = (data.data.AdminDetail.RoleID == 5);
                    $scope.temp.param.hubIDs = [];
                    $scope.temp.hubUsers = [];
                    $scope.temp.deletedHubUsers = [];
                    $scope.temp.addedHubUsers = [];

                    hub.HubUsers.forEach(function (obj) {
                        var hub = {
                            key: obj.Hub.Name,
                            value: obj.Hub.HubID
                        };
                        $scope.admin.hubUsers.push(hub);
                        $scope.temp.hubUsers.push(hub);
                        $scope.temp.param.hubIDs.push(obj.Hub.HubID);
                    });

                    getHubs(function (data) {
                        $scope.hubs = [];
                        data.data.Hubs.rows.forEach(function (val, key) {
                            $scope.hubs.push({
                                key: val.Name,
                                value: val.HubID
                            });
                        });
                        $rootScope.$emit('stopSpin');
                    });
                });
            } else {
                $rootScope.$emit('stopSpin');
            }
        });
    }

    function getHubUser (callback) {
        $scope.id = $stateParams.userID;
        Services2.getHubUser({userID: $scope.id}).$promise
        .then(function (data) {
            callback(data.data);
        });
    }

    $scope.chooseHubInDetail = function (data) {
        $scope.temp.hub = data;
    }

    function addOrDeletedHubUsersInfo () {
        $scope.temp.addedHubUsers = [];
        $scope.temp.deletedHubUsers = [];

        $scope.temp.hubUsers.forEach(function (obj) {
            var idx = lodash.findIndex($scope.admin.hubUsers, {'value': obj.value});
            if (idx < 0) {
                $scope.temp.addedHubUsers.push(obj);
            }
        });
        $scope.admin.hubUsers.forEach(function (obj) {
            var idx = lodash.findIndex($scope.temp.hubUsers, {'value': obj.value});
            if (idx < 0) {
                $scope.temp.deletedHubUsers.push(obj);
            }
        });
    }

    $scope.addHubInDetail = function () {
        var addedHubData = {
            key: $scope.temp.hub.key,
            value: $scope.temp.hub.value
        };
        $scope.temp.hubUsers.push(addedHubData);
        $scope.temp.param.hubIDs.push($scope.temp.hub.value);
        
        $scope.temp.hub = null;
    }

    $scope.deleteHubInDetail = function (hubID) {
        lodash.remove($scope.temp.hubUsers, {
            value: hubID
        });
        var idx = $scope.temp.param.hubIDs.indexOf(hubID);
        $scope.temp.param.hubIDs.splice(idx, 1);
    }

    function getHubs (callback) {
        Services2.getHubs().$promise
        .then(function (data) {
            callback(data);
        });
    }

    $scope.modalUpdateAdminDetail = function (admin) {
        addOrDeletedHubUsersInfo();

        ngDialog.open({
            template: 'modalUpdateAdminDetail',
            scope: $scope,
            className: 'ngdialog-theme-default',
            closeByDocument: false
        });
    }

    $scope.updateAdminDetail = function () {
        $rootScope.$emit('startSpin');
        var params = $scope.temp.param;

        Services2.updateHubAdmin({userID: $scope.id}, params).$promise
        .then(function (data) {
            $scope.closeModal();
            $rootScope.$emit('stopSpin');
            getAdminDetail();
        })
        .catch(function(err) {
            $scope.closeModal();
            SweetAlert.swal('Error', err.data.error.message, 'error');
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.detailsPage = function(id) {
        $window.open('/admin/details/' + id);
    };

    /**
     * Load details
     * 
     * @return {void}
     */
    $scope.loadDetails = function() {
        if ($stateParams.userID !== undefined) {
            getAdminDetail();
        }
    }

    $scope.loadDetails();

  });
