'use strict';

angular.module('adminApp')
    .controller('AuditTrailCtrl', 
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

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;

    $scope.optionsDatepicker = {
        separator: ':',
        eventHandlers: {
            'apply.daterangepicker': function(ev, picker) {
                if (!ev.model.startDate && !ev.model.endDate) {
                    $scope[$scope.pickerName] = {
                        startDate: new Date().setHours(0, 0, 0, 0),
                        endDate: new Date().setHours(23, 59, 59, 59)
                    };
                }
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                $scope.getAuditTrails();
            }
        }
    };

    $scope.timestampDatePicker = {
        startDate: $location.search().startDropoff || null,
        endDate: $location.search().endDropoff || null
    };

    // Generated scope:
    // timestampDatePicker
    // startTimestamp, endTimestamp
    angular.forEach(['Timestamp'], function (val) {
        $scope.$watch(
            (val.toLowerCase() + 'DatePicker'),
            function (date) {
                if (date.startDate) { $location.search('start' + val, (new Date(date.startDate)).toISOString()); }
                if (date.endDate) { $location.search('end' + val, (new Date(date.endDate)).toISOString()); }
            }
        );
    });

    /*
     * Set picker name for filter
     * 
    */
    $scope.setPickerName = function(pickerName) {
        $scope.pickerName = pickerName;
    }

    var tableFilterSearch = ['user', 'page', 'action', 'dataChanged'];

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
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function () {
        $window.history.back();
    }

    /**
     * Clear Filter
     * 
     * @return {void}
     */
    $scope.clearFilter = function(item) {
        $state.reload();
    }

    $scope.searchList = function () {
        tableFilterSearch.forEach(function (val) {
            $location.search(val, $scope.temp.filter[val]);
        });

        $scope.getAuditTrails();
    }

    var getAdminListParam = function () {
        var param = {};
        $location.search('offset', $scope.offset);

        lodash.each(tableFilterSearch, function (val) {
            $scope.temp.filter[val] = $location.search()[val] || $scope.temp.filter[val];
        });
        angular.forEach(['Timestamp'], function (data) {
            $scope[data.toLowerCase() + 'DatePicker'].startDate = 
                    ($location.search()['start' + data]) ?
                    new Date($location.search()['start' + data]) :
                    $scope[data.toLowerCase() + 'DatePicker'].startDate;

            $scope[data.toLowerCase() + 'DatePicker'].endDate = 
                    ($location.search()['end' + data]) ?
                    new Date($location.search()['end' + data]) :
                    $scope[data.toLowerCase() + 'DatePicker'].endDate;
        });

        if ($scope.timestampDatePicker.startDate) {
            $scope.timestampDatePicker.startDate = new Date($scope.timestampDatePicker.startDate);     
        }
        if ($scope.timestampDatePicker.endDate) {
            $scope.timestampDatePicker.endDate = new Date($scope.timestampDatePicker.endDate);
        }

        param.offset = $scope.offset;
        param.limit = $scope.itemsByPage;
        param.user = $scope.temp.filter.user;
        param.page = $scope.temp.filter.page;
        param.action = $scope.temp.filter.action;
        param.dataChanged = $scope.temp.filter.dataChanged;

        param.startTimeStamp = $scope.timestampDatePicker.startDate;
        param.endTimeStamp = $scope.timestampDatePicker.endDate;

        return param;
    }

    /**
     * Get all admin
     * 
     * @return {void}
     */
    $scope.getAuditTrails = function () {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;

        var params = getAdminListParam();
        Services2.getAuditTrails(params).$promise.then(function (data) {
            $scope.displayed = data.data.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $scope.displayedFound = data.data.count;
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.closeModal = function () {
        ngDialog.close();
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
        $scope.getAuditTrails();
    }

});