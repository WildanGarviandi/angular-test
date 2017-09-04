'use strict';

angular.module('adminApp')
    .controller('DriverCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope, 
            Services, 
            Services2,
            SweetAlert,
            moment, 
            lodash, 
            $state, 
            $stateParams,
            $location, 
            $http, 
            $httpParamSerializer,
            $window,
            ngDialog,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.dataOnModal = {};
    $scope.temp = {};

    $scope.driver = {
        CanTakeCOD: 0,
        Driver: {
            FirstName: '',
            LastName: '',
            Email: '',
            PhoneNumber: '',
            StatusID: '',
            DriverAvailability: ''
        }
    };

    $scope.status = {
        key: 'All',
        value: 'All'
    };

    $scope.codStatus = {
        key: 'All',
        value: 'all'
    };

    $scope.companies = [{
        CompanyDetailID: 'all',
        CompanyName: 'All'
    }];

    $scope.availability = {
        key: 'All',
        value: 'all'
    };

    $scope.company = $scope.companies[0];

    $scope.codStatuses = [$scope.codStatus,  {
        key: 'No',
        value: 0
    }, {
        key: 'Yes',
        value: 1
    }];

    $scope.availabilities = [$scope.availability,  {
        key: 'No',
        value: 0
    }, {
        key: 'Yes',
        value: 1
    }];

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;


    var updateDriver = function(callback) {
        if (!($scope.company && $scope.company.CompanyDetailID && $scope.company.User && $scope.company.User.UserID)) {
            SweetAlert.swal({
                title: 'Failed Update',
                text: 'Fleet Company Required',
                type: 'error',
                html: true
            });
        }
        if (typeof $scope.driver.DriverDetail.CanTakeCOD === 'undefined') {
            $scope.driver.DriverDetail.CanTakeCOD = false;
        }
        var driver = {
            CanTakeCOD: $scope.driver.DriverDetail.CanTakeCOD,
            Driver: {
                FirstName: $scope.driver.FirstName,
                LastName: $scope.driver.LastName,
                Email: $scope.driver.Email,
                PhoneNumber: $scope.driver.PhoneNumber,
                StatusID: $scope.driver.Driver.StatusID,
                DriverAvailability: $scope.driver.Driver.DriverAvailability,
            },
            FleetDriver: {
                CompanyDetailID: $scope.company.CompanyDetailID,
                FleetManagerID: $scope.company.User.UserID,
                FleetManagerDriverID: $scope.driver.Driver.FleetManagerDriverID
            }
        };
        $rootScope.$emit('startSpin');
        Services2.updateDriver({
            id: $stateParams.driverID
        }, driver).$promise.then(function(response, error) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response);
            } else {
                return callback(error);
            }
        })
        .catch(function(err) {
            $rootScope.$emit('stopSpin');
            return callback(err);
        });
    }

    /**
     * Get status
     * 
     * @return {void}
     */
    $scope.getStatus = function() {
        return $q(function (resolve) {
            Services2.getUserStatus().$promise.then(function(data) {
                $scope.statuses = []; 
                if ($stateParams.driverID === undefined) {
                    $scope.statuses.push($scope.status);
                }
                data.data.Statuses.rows.forEach(function(status) {
                    $scope.statuses.push({key: status.StatusName, value: status.StatusId});
                });
                resolve();
            });
        });
    }

    /**
     * Get all companies
     * 
     * @return {Object} Promise
     */
    var getCompanies = function() {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getAllCompanies().$promise.then(function(result) {
                var companies = lodash.sortBy(result.data.Companies, function (i) { 
                    return i.CompanyName.toLowerCase(); 
                });
                $scope.companies = $scope.companies.concat(companies);
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    // Here, model and param have same naming format
    var pickedVariables = {
        'Status': {
            model: 'status',
            pick: 'value',
            collection: 'statuses'
        },
        'Company': {
            model: 'company',
            pick: 'CompanyDetailID',
            collection: 'companies'
        },
        'CodStatus': {
            model: 'codStatus',
            pick: 'value',
            collection: 'codStatuses'
        },
        'Availability': {
            model: 'availability',
            pick: 'value',
            collection: 'availabilities'
        },
    };

    // Generates
    // chooseStatus, chooseCompany, chooseCodStatus
    lodash.each(pickedVariables, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getDrivers(); 
        };
    });


    $scope.manageAvailabilitiesFilter = function (obj) {
        return obj.value !== 'all';
    }

    /**
     * Assign status to the chosen item on edit page
     * 
     * @return {void}
     */
    $scope.chooseStatusEdit = function(item) {
        $scope.driver.Driver.StatusID = item.value;
        $scope.status = item;
    }

    /**
     * Assign status to the chosen item on edit page
     * 
     * @return {void}
     */
    $scope.chooseCompanyEdit = function(item) {
        $scope.driver.Driver.CompanyDetailID = item.CompanyDetailID;
        $scope.company = item;
    }

    /**
     * Change availability to the chosen item on edit page
     * 
     * @return {void}
     */
    $scope.chooseAvailabilityEdit = function(item) {
        $scope.driver.Driver.DriverAvailability = item.value;
    }

    /**
     * Redirect to edit driver page
     * 
     * @return {void}
     */
    $scope.editDriver = function(id) {
        window.location = '/update-driver/' + id;
    }

    /**
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function() {
        $window.history.back();
    } 

    /**
     * Update single driver
     * 
     * @return {void}
     */
    $scope.updateDriver = function() {
        updateDriver(function(err, driver) {
            if (err) {
                SweetAlert.swal({
                    title: 'Failed',
                    text: 'Error: '+ err.data.error.message,
                    type: 'error',
                    html: true
                });
            } else {
                SweetAlert.swal({
                    title: 'Success',
                    text: 'Your driver ID:' + driver.data.Driver.UserID + ' has been successfully updated.',
                    type: 'success',
                    html: true
                }, function (isConfirm){
                    $location.path('/drivers');
                });
            } 
        });
    }   

    /**
     * Get single driver
     * 
     * @return {void}
     */
    $scope.getDriverDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.driverID;
        Services2.getOneDriver({
            id: $scope.id,
        }).$promise.then(function(data) {
            $scope.driver = data.data.Driver;
            $scope.status = {key: $scope.driver.UserStatus.StatusName, value: $scope.driver.UserStatus.StatusId};
            $scope.availability = {key: data.data.Driver.DriverAvailability ? 'Yes': 'No', value: $scope.driver.DriverAvailability};
            $scope.company = lodash.find($scope.companies, {
                CompanyDetailID: data.data.Driver.Driver.CompanyDetail.CompanyDetailID});
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get all drivers
     * 
     * @return {void}
     */
    $scope.getDrivers = function() {
        $rootScope.$emit('startSpin');
        if ($stateParams.query) {
            $scope.reqSearchString = $stateParams.query;
        }
        var paramsQuery = {
            'name': 'queryName',
            'email': 'queryEmail',
            'phone': 'queryPhone',
        };
        lodash.each(paramsQuery, function (val, key) {
            $scope[val] = $location.search()[key] || $scope[val];
        });

        lodash.each(pickedVariables, function (val, key) {
            var value = $location.search()[val.model] || $scope[val.model][val.pick];
            var findObject = {};
            findObject[val.pick] = (parseInt(value)) ? parseInt(value) : value;
            $scope[val.model] = lodash.find($scope[val.collection], findObject);
        });

        $location.search('offset', $scope.offset);
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            name: $scope.queryName,
            email: $scope.queryEmail,
            phone: $scope.queryPhone,
            status: $scope.status.value,
            codStatus: $scope.codStatus.value,
            availability: $scope.availability.value,
            company: $scope.company.CompanyDetailID
        };
        Services2.getDrivers(params).$promise.then(function(data) {
            $scope.displayed = data.data.Drivers.rows;
            $scope.displayed.forEach(function(object){
                object.CanTakeCOD = (object.CanTakeCOD === true) ? 'Yes' : 'No';
            })
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.Drivers.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    var variables = {
        'Name': {
            model: 'queryName',
            param: 'name'
        },
        'Phone': {
            model: 'queryPhone',
            param: 'phone'
        },
        'Email': {
            model: 'queryEmail',
            param: 'email'
        }
    };

    // Generates:
    // searchName, searchPhone, searchEmail
    lodash.each(variables, function (val, key) {
        $scope['search' + key] = function(event){
            if ((event && event.keyCode === 13) || !event) {
                $location.search(val.param, $scope[val.model]);
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                $scope.getDrivers();
            }
        };
    });

    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {
        $scope.tableState = state;
        if ($scope.isFirstLoaded) {
            $scope.tableState.pagination.start = $scope.offset;
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        $scope.getStatus().then($scope.getDrivers);
    }

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        getCompanies().then(function () {
            if ($stateParams.driverID !== undefined) {
                $scope.getDriverDetails();
                $scope.getStatus();
                $scope.updatePage = true;
                $scope.addPage = false;
            } else {
                $scope.addPage = true;
            }
        });
    }

    $scope.loadManagePage();

    /**
     * Refresh list with user input request
     * 
     * @return {void}
     */
    $scope.refresh = function(item) {
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getDrivers(); 
    }

    /**
     * Clear Filter
     * 
     * @return {void}
     */
    $scope.clearFilter = function(item) {
        $state.reload();
    }
    
    $scope.closeModal = function () {
        ngDialog.close();
    }

    $scope.referralCodeModal = function (driver) {
        $scope.dataOnModal.userID = driver.UserID;
        $scope.temp.referralCode = driver.Driver.ReferralCode;
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
            $scope.getDrivers();
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
            params.userType = 3;

        Services2.exportReferral(params).$promise
        .then(function (data) {
            maxExport = data.data.count;
            var mandatoryUrl = 'exportType=' + type + '&' + 'maxExport=' + maxExport;
            var params = {};
                params.userType = 3;
            $window.open('/export?' + mandatoryUrl + '&' + $httpParamSerializer(params));
        });
    }

    $scope.driverLocation = function() {
        $window.open('/driverLocation');
    };

});
