'use strict';

angular.module('adminApp')
    .controller('DriverScheduleCtrl', 
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
            ngDialog,
            SweetAlert,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.startDatePicker = {
        startDate: $location.search().minStart || null,
        endDate: $location.search().maxStart || null
    };

    $scope.endDatePicker = {
        startDate: $location.search().minEnd || null,
        endDate: $location.search().maxEnd || null
    };

    $scope.createdDatePicker = {
        startDate: new Date(),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7)
    };

    $scope.status = {
        key: 'All',
        value: 'All'
    };

    $scope.scheduleType = {
        key: 'All',
        value: ''
    };

    $scope.scheduleTypes = [$scope.scheduleType];

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
            $scope.scheduleTypes = $scope.scheduleTypes.concat(data.scheduleTypes);
        });
    };

    getDefaultValues();

    /**
     * Get all companies
     * 
     * @return {Object} Promise
     */
    var getCompanies = function () {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getAllCompanies().$promise.then(function(result) {
                var companies = lodash.sortBy(result.data.Companies, function (i) { 
                    return i.CompanyName.toLowerCase(); 
                });
                $scope.companies = companies;
                $scope.company = $scope.companies[0];
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Call getDrivers function when a company is choosen
     * @param  {[type]} company [description]
     * @return {Object} promise of data of all drivers
     */
    $scope.chooseCompany = function (company) {
        $scope.company = company;
        $scope.drivers = [];
        $scope.isFetchingDrivers = true;
        var params = {
            offset: 0,
            limit: 0,
            status: 'All',
            codStatus: 'all',
            company: company.CompanyDetailID
        };
        $scope.getDrivers(params);
    };

    /**
     * Get all drivers
     * 
     * @return {Object} Promise
     */
    $scope.getDrivers = function(params) {
        $rootScope.$emit('startSpin');
        Services2.getDrivers(params).$promise.then(function(result) {
            params.limit = result.data.Drivers.count;
            Services2.getDrivers(params).$promise.then(function(result) {
                var drivers = [];
                result.data.Drivers.rows.forEach(function(driver){
                    drivers.push({key: driver.UserID, value: driver.Driver.FirstName + ' ' + driver.Driver.LastName})
                });
                drivers = lodash.sortBy(drivers, function (i) { 
                    return i.value.toLowerCase(); 
                });
                $scope.drivers = drivers;
                $scope.driver = $scope.drivers[0];
                $rootScope.$emit('stopSpin');
            });
        });
    };

    /**
     * Open create Unavailable Driver modals
     * @return void
     */
    $scope.openCreateUnavailableDriverModal = function () {
        $rootScope.$emit('startSpin');
        $scope.isFetchingDrivers = false;
        $scope.isFetchingDate = false;
        getCompanies()
        .then(function () {
            ngDialog.open({
                template: 'createUnavailableDriverTemplate',
                scope: $scope,
                className: 'ngdialog-theme-default create-cod-payment-popup'
            });
        });
    };
    
    /**
     * Cancel Modal
     * @return void
     */
    $scope.cancelModal = function() {
        ngDialog.close();
    }

    /**
     * Create Unavailable Driver
     * @return void
     */
    $scope.createUnavailableDriver = function() {
        var userID = $scope.selectedUserID;
        var params = {
            UserID: userID,
            StartDate: $scope.createdDatePicker.startDate,
            EndDate: $scope.createdDatePicker.endDate
        };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You will create Unavailale Driver with driver \n"
                + $scope.selectedUserName
                + "\n" 
                + "Start: " 
                + $scope.createdDatePicker.startDate 
                + "\n" 
                + "End: "
                + $scope.createdDatePicker.endDate,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, create it!",
            closeOnConfirm: false
        },
        function(isConfirm){
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                Services2.createUnavailableDriverSchedule(params).$promise.then(function(result) {
                    SweetAlert.swal('Success', 'Unavailale Driver has been created', 'success');
                    ngDialog.close();
                    $rootScope.$emit('stopSpin');
                })
                .catch(function(err) {
                    SweetAlert.swal('Error', err.data.error.message, 'error');
                    $rootScope.$emit('stopSpin');
                });
            } else {
                return false;
            }
        });
    }

    $scope.getStartAndEndDate = function (item) {
        $scope.selectedUserID = item.key;
        $scope.selectedUserName = item.value;
        $scope.isFetchingDate = true;
    }

    /**
     * Get status
     * 
     * @return {void}
     */
    $scope.getStatus = function() {
        return $q(function (resolve) {
            Services2.getStatus().$promise.then(function(data) {
                $scope.statuses = []; 
                $scope.statuses.push($scope.status);
                data.data.rows.forEach(function(status) {
                    $scope.statuses.push({key: status.OrderStatus, value: status.OrderStatusID});
                });
                resolve();
            });
        });
    };

    // Here, model and param have same naming format
    var pickedVariables = {
        'ScheduleType': {
            model: 'scheduleType',
            pick: 'value',
            collection: 'scheduleTypes'
        },
        'Status': {
            model: 'status',
            pick: 'value',
            collection: 'statuses'
        }
    };

    // Generates
    // chooseScheduleType, chooseStatus
    lodash.each(pickedVariables, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getDriverSchedules(); 
        };
    });

    $scope.optionsDatepicker = {
        separator: ':',
        eventHandlers: {
            'apply.daterangepicker': function(ev, picker) {
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                $scope.getDriverSchedules();
            }
        }
    };

    // Generated scope:
    // StartDatePicker, EndDatePicker
    // minStartDate, maxStartDate, minEndDate, maxEndDate
    ['Start', 'End'].forEach(function (val) {
        $scope.$watch(
            (val.toLowerCase() + 'DatePicker'),
            function (date) {
                if (date.startDate) { $location.search('min' + val, (new Date(date.startDate)).toISOString()); }
                if (date.endDate) { $location.search('max' + val, (new Date(date.endDate)).toISOString()); }
            }
        );
    });

    var variables = {
        'Driver': {
            model: 'queryDriver',
            param: 'name'
        }
    };

    // Generates:
    // searchDriver
    lodash.each(variables, function (val, key) {
        $scope['search' + key] = function(event){
            if ((event && event.keyCode === 13) || !event) {
                $location.search(val.param, $scope[val.model]);
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                $scope.getDriverSchedules();
            }
        };
    });

    /**
     * Redirect to edit driver schedule page
     * 
     * @return {void}
     */
    $scope.editDriverSchedule = function(id) {
        window.location = '/update-driverschedule/' + id;
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
     * Get all driver schedule
     * 
     * @return {void}
     */
    $scope.getDriverSchedules = function() {
        $rootScope.$emit('startSpin');
        if ($stateParams.query) {
            $scope.reqSearchString = $stateParams.query;
        }
        var paramsQuery = {
            'driver': 'queryDriver'
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

        ['Start', 'End'].forEach(function (data) {
            $scope[data.toLowerCase() + 'DatePicker'].startDate = 
                    ($location.search()['min' + data]) ?
                    new Date($location.search()['min' + data]) :
                    $scope[data.toLowerCase() + 'DatePicker'].startDate;
            $scope[data.toLowerCase() + 'DatePicker'].endDate = 
                    ($location.search()['max' + data]) ?
                    new Date($location.search()['max' + data]) :
                    $scope[data.toLowerCase() + 'DatePicker'].endDate;
        });

        $location.search('offset', $scope.offset);
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            driver: $scope.queryDriver,
            scheduleType: $scope.scheduleType.value,
            minStartDate: $scope.startDatePicker.startDate,
            maxStartDate: $scope.startDatePicker.endDate,
            minEndDate: $scope.endDatePicker.startDate,
            maxEndDate: $scope.endDatePicker.endDate,
            orderStatus: $scope.status.value,
        };
        Services2.getDriverSchedules(params).$promise.then(function(data) {
            $scope.driverScheduleFound = data.data.count;
            $scope.displayed = data.data.rows;
            $scope.displayed.forEach(function (val, index, array) {
                array[index].ScheduleType = (lodash.find($scope.scheduleTypes, {value: val.ScheduleType})).key;
            });
            
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

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
        $scope.getStatus().then($scope.getDriverSchedules);
    }

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        if ($stateParams.driverID !== undefined) {

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
        $scope.getDriverSchedules(); 
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
