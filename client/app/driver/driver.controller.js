'use strict';

angular.module('adminApp')
    .controller('DriverCtrl', 
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
            $window
        ) {

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.driver = {
        CanTakeCOD: 0,
        Driver: {
            FirstName: '',
            LastName: '',
            Email: '',
            PhoneNumber: '',
            StatusID: ''
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

    $scope.codStatuses = [$scope.codStatus,  {
        key: 'No',
        value: '0'
    }, {
        key: 'Yes',
        value: '1'
    }];

    $scope.itemsByPage = 10;
    $scope.offset = 0;


    var updateDriver = function(callback) {
        if ($scope.driver.CanTakeCOD === undefined) {
            $scope.driver.CanTakeCOD = false;
        }
        var driver = {
            CanTakeCOD: $scope.driver.CanTakeCOD,
            Driver: {
                FirstName: $scope.driver.Driver.FirstName,
                LastName: $scope.driver.Driver.LastName,
                Email: $scope.driver.Driver.Email,
                PhoneNumber: $scope.driver.Driver.PhoneNumber,
                StatusID: $scope.driver.Driver.StatusID
            }
        };
        $rootScope.$emit('startSpin');
        Services2.updateDriver({
            id: $stateParams.driverID
        }, driver).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response);
            } else {
                return callback('failed');
            }
        })
        .catch(function() {
            $rootScope.$emit('stopSpin');
            return callback('failed');
        });
    }

    /**
     * Get status
     * 
     * @return {void}
     */
    $scope.getStatus = function() {
        Services2.getUserStatus().$promise.then(function(data) {
            $scope.statuses = []; 
            if ($stateParams.driverID === undefined) {
                $scope.statuses.push($scope.status);
            }
            data.data.Statuses.rows.forEach(function(status) {
                $scope.statuses.push({key: status.StatusName, value: status.StatusId});
            }); 
        });
    }

    /**
     * Assign status to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseStatus = function(item) {
        $scope.status = item;
        $scope.getDrivers(); 
    }

    /**
     * Choose status COD
     * 
     * @return {void}
     */
    $scope.chooseCodStatus = function(item) {
        $scope.codStatus = item;
        $scope.offset = 0;
        if (!$stateParams.query) {
            $scope.getDrivers();
        }
    };

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
            if (driver.data.Driver) {
                alert('Your driver ID:' + driver.data.Driver.UserID + ' has been successfully updated.');
                $location.path('/drivers');
            } else {
                alert('Error:' + err );             
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
            $scope.status = {key: $scope.driver.Driver.UserStatus.StatusName, value: $scope.driver.Driver.UserStatus.StatusId};
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
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            name: $scope.reqSearchName,
            email: $scope.reqSearchEmail,
            phone: $scope.reqSearchPhone,
            status: $scope.status.value,
            codStatus: $scope.codStatus.value
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

    /**
     * Add search name
     * 
     * @return {void}
     */
    $scope.reqSearchName = '';
    $scope.searchName = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchName = $scope.queryName;
            $scope.getDrivers();
        };
    }

    /**
     * Add search phone
     * 
     * @return {void}
     */
    $scope.reqSearchPhone = '';
    $scope.searchPhone = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchPhone = $scope.queryPhone;
            $scope.getDrivers();
        };
    }

    /**
     * Add search email
     * 
     * @return {void}
     */
    $scope.reqSearchEmail = '';
    $scope.searchEmail = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchEmail = $scope.queryEmail;
            $scope.getDrivers();
        };
    }

    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {
        $scope.offset = state.pagination.start;
        $scope.tableState = state;
        $scope.getStatus(); 
        $scope.getDrivers();
        $scope.isFirstLoaded = true;
    }

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        if ($stateParams.driverID !== undefined) {
            $scope.getDriverDetails();
            $scope.getStatus(); 
            $scope.updatePage = true;
            $scope.addPage = false;
        } else {
            $scope.addPage = true;
        }
    }

    $scope.loadManagePage();

  });
