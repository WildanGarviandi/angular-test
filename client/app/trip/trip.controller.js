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
            $window,
            config
        ) {

    Auth.getCurrentUser().then(function(data) {
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

    $scope.currency = config.currency + " ";
    $scope.isFirstSort = true;

    /**
     * Get status
     * 
     * @return {void}
     */
    $scope.getStatus = function() {
        Services2.getStatus().$promise.then(function(data) {
            $scope.statuses = []; 
            $scope.statuses.push($scope.status);
            data.data.rows.forEach(function(status) {
                $scope.statuses.push({key: status.OrderStatus, value: status.OrderStatusID});
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
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
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
        }
        if ($scope.pickupDatePicker.endDate) {
            $scope.pickupDatePicker.endDate = new Date($scope.pickupDatePicker.endDate);
        }
        if ($scope.dropoffDatePicker.startDate) {
            $scope.dropoffDatePicker.startDate = new Date($scope.dropoffDatePicker.startDate);     
        }
        if ($scope.dropoffDatePicker.endDate) {
            $scope.dropoffDatePicker.endDate = new Date($scope.dropoffDatePicker.endDate);
        }
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            tripNumber: $scope.queryTripNumber,
            containerNumber: $scope.queryContainerNumber,
            district: $scope.queryDistrict,
            driver: $scope.queryDriver,
            pickup: $scope.queryPickup,
            dropoff: $scope.queryDropoff,
            status: $scope.status.value,
            startPickup: $scope.pickupDatePicker.startDate,
            endPickup: $scope.pickupDatePicker.endDate,
            startDropoff: $scope.dropoffDatePicker.startDate,
            endDropoff: $scope.dropoffDatePicker.endDate,
            sortBy: $scope.sortBy,
            sortCriteria: $scope.sortCriteria,
        }
        Services2.getTrip(params).$promise.then(function(data) {
            $scope.displayed = data.data.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getTrip();
        };
    }

    /**
     * Sort by column
     * 
     * @return {void}
     */
    $scope.sortColumn = function(sortBy, sortCriteria) {
        $scope.sortBy = sortBy;
        $scope.sortCriteria = sortCriteria;
        $scope.isFirstSort = false;
        $scope.getTrip();
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
            $scope.trip = data.data;
            if ($scope.trip.UserOrderRoutes) {
                $scope.trip.UserOrderRoutes.forEach(function(route){
                    switch (route.UserOrder.PickupType) {
                        case 1:
                            route.UserOrder.PickupType = 'Now';
                            break;        
                        case 2:
                            route.UserOrder.PickupType = 'Later';
                            break;    
                        case 3:
                            route.UserOrder.PickupType = 'On Demand';
                            break;    
                        default:
                            route.UserOrder.PickupType = '-';
                    }
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

    /**
     * Refresh list with user input request
     * 
     * @return {void}
     */
    $scope.refresh = function(item) {
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getTrip(); 
    }

  });
