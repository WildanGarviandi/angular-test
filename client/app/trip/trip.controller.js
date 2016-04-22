'use strict';

angular.module('adminApp')
    .controller('TripCtrl', 
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

    $scope.itemsByPage = 10;
    $scope.offset = 0;

    $scope.status = {
        key: 'All',
        value: 'All'
    };

    $scope.pickupDatePicker = {
        startDate: null,
        endDate: null
    };

    $scope.dropoffDatePicker = {
        startDate: null,
        endDate: null
    };

    $scope.optionsDatepicker = {
        separator: ':',
        eventHandlers: {
            'apply.daterangepicker': function(ev, picker) {
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                $scope.getTrip();
            }
        }
    };

    /**
     * Get status
     * 
     * @return {void}
     */
    $scope.getStatus = function() {
        Services2.getStatus().$promise.then(function(data) {
            $scope.statuses = []; 
            $scope.statuses.push($scope.status);
            data.rows.forEach(function(status) {
                $scope.statuses.push({key: status.OrderStatus, value: status.OrderStatusID});
            }); 
            console.log($scope.statuses);
        });
    }

    /**
     * Assign status to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseStatus = function(item) {
        $scope.status = item;
        $scope.getTrip(); 
    }

    /**
     * Get all trips
     * 
     * @return {void}
     */
    $scope.getTrip = function() {
        $rootScope.$emit('startSpin');
        if ($scope.pickupDatePicker.startDate) {
            $scope.pickupDatePicker.startDate = new Date($scope.pickupDatePicker.startDate);
            $scope.pickupDatePicker.startDate.setHours(
                $scope.pickupDatePicker.startDate.getHours() - $scope.pickupDatePicker.startDate.getTimezoneOffset() / 60
            );
        }
        if ($scope.pickupDatePicker.endDate) {
            $scope.pickupDatePicker.endDate = new Date($scope.pickupDatePicker.endDate)
            $scope.pickupDatePicker.endDate.setHours(
                $scope.pickupDatePicker.endDate.getHours() - $scope.pickupDatePicker.endDate.getTimezoneOffset() / 60
            );
        }
        if ($scope.dropoffDatePicker.startDate) {
            $scope.dropoffDatePicker.startDate = new Date($scope.dropoffDatePicker.startDate);
            $scope.dropoffDatePicker.startDate.setHours(
                $scope.dropoffDatePicker.startDate.getHours() - $scope.dropoffDatePicker.startDate.getTimezoneOffset() / 60
            );           
        }
        if ($scope.dropoffDatePicker.endDate) {
            $scope.dropoffDatePicker.endDate = new Date($scope.dropoffDatePicker.endDate);
            $scope.dropoffDatePicker.endDate.setHours(
                $scope.dropoffDatePicker.endDate.getHours() - $scope.dropoffDatePicker.endDate.getTimezoneOffset() / 60
            );
        }
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            tripNumber: $scope.reqSearchTripNumber,
            containerNumber: $scope.reqSearchContainerNumber,
            district: $scope.reqSearchDistrict,
            driver: $scope.reqSearchDriver,
            pickup: $scope.reqSearchPickup,
            dropoff: $scope.reqSearchDropoff,
            status: $scope.status.value,
            startPickup: $scope.pickupDatePicker.startDate,
            endPickup: $scope.pickupDatePicker.endDate,
            startDropoff: $scope.dropoffDatePicker.startDate,
            endDropoff: $scope.dropoffDatePicker.endDate,
        }
        Services2.getTrip(params).$promise.then(function(data) {
            $scope.displayed = data.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Add search trip number
     * 
     * @return {void}
     */
    $scope.reqSearchTripNumber = '';
    $scope.searchTrip = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchTripNumber = $scope.queryTripNumber;
            $scope.getTrip();
        };
    }

    /**
     * Add search container number
     * 
     * @return {void}
     */
    $scope.reqSearchContainerNumber = '';
    $scope.searchContainer = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchContainerNumber = $scope.queryContainerNumber;
            $scope.getTrip();
        };
    }

    /**
     * Add search district
     * 
     * @return {void}
     */
    $scope.reqSearchDistrict = '';
    $scope.searchDistrict = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchDistrict = $scope.queryDistrict;
            $scope.getTrip();
        };
    }

    /**
     * Add search driver
     * 
     * @return {void}
     */
    $scope.reqSearchDriver = '';
    $scope.searchDriver = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchDriver = $scope.queryDriver;
            $scope.getTrip();
        };
    }

    /**
     * Add search pickup
     * 
     * @return {void}
     */
    $scope.reqSearchPickup = '';
    $scope.searchPickup = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchPickup = $scope.queryPickup;
            $scope.getTrip();
        };
    }

    /**
     * Add search dropoff
     * 
     * @return {void}
     */
    $scope.reqSearchDropoff = '';
    $scope.searchDropoff = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchDropoff = $scope.queryDropoff;
            $scope.getTrip();
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
        $scope.getTrip();
        $scope.isFirstLoaded = true;
    }

    $scope.pickerFocus = function() {
        focus('date-picker');
    };

    $scope.detailsPage = function(id) {
        window.location = '/trip/details/' + id;
    };

    /**
     * Get single trip
     * 
     * @return {void}
     */
    $scope.getTripDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.tripID;
        Services2.getTripDetails({
            id: $scope.id,
        }).$promise.then(function(data) {
            $scope.trip = data;
            if ($scope.trip.UserOrderRoutes) {
                $scope.trip.UserOrderRoutes.forEach(function(route){
                    route.UserOrder.PickupType = (route.UserOrder.PickupType === 1) ? 'Later' : 'Now';
                    route.UserOrder.PaymentType = (route.UserOrder.PaymentType === 2) ? 'Wallet' : 'Cash';
                })
            }
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Load details
     * 
     * @return {void}
     */
    $scope.loadDetails = function() {
        if ($stateParams.tripID !== undefined) {
            $scope.getTripDetails();
        }
    }

    $scope.loadDetails();
    $scope.isCollapsed = true;


  });
