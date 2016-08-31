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
            $window,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
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

    $scope.companies = [{
        CompanyDetailID: 'all',
        CompanyName: 'All'
    }];

    $scope.company = $scope.companies[0];

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
                StatusID: $scope.driver.Driver.StatusID,
            },
            FleetDriver: {
                CompanyDetailID: $scope.company.CompanyDetailID,
                FleetManagerID: $scope.company.User.UserID,
                FleetManagerDriverID: $scope.driver.Driver.Driver.FleetManagerDriverID
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

    /**
     * Assign status to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseStatus = function(item) {
        $scope.status = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getDrivers(); 
    }

    /**
     * Assign fleet company to the chosen item
     * @param  {Object} item
     * 
     */
    $scope.chooseCompany = function(item) {
        $scope.company = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getDrivers(); 
    };

    /**
     * Choose status COD
     * 
     * @return {void}
     */
    $scope.chooseCodStatus = function(item) {
        $scope.codStatus = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
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
     * Assign status to the chosen item on edit page
     * 
     * @return {void}
     */
    $scope.chooseCompanyEdit = function(item) {
        $scope.driver.Driver.CompanyDetailID = item.CompanyDetailID;
        $scope.company = item;
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
                alert('Error: '+ err.data.error.message );
            } else {
                alert('Your driver ID:' + driver.data.Driver.UserID + ' has been successfully updated.');
                $location.path('/drivers');
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
            $scope.company = lodash.find($scope.companies, {
                CompanyDetailID: data.data.Driver.Driver.Driver.CompanyDetail.CompanyDetailID});
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
            name: $scope.queryName,
            email: $scope.queryEmail,
            phone: $scope.queryPhone,
            status: $scope.status.value,
            codStatus: $scope.codStatus.value,
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

    /**
     * Add search name
     * 
     * @return {void}
     */
    $scope.reqSearchName = '';
    $scope.searchName = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchName = $scope.queryName;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
        getCompanies();
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
    
  });
