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
            config,
            $q,
            ngDialog
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;

    $scope.status = {
        key: 'All',
        value: 'All'
    };

    $scope.pickupDatePicker = {
        startDate: $location.search().startPickup || null,
        endDate: $location.search().endPickup || null
    };

    $scope.dropoffDatePicker = {
        startDate: $location.search().startDropoff || null,
        endDate: $location.search().endDropoff || null
    };

    $scope.step = {
        key: 'All',
        value: 'All'
    };

    /*
     * Set picker name for filter
     * 
    */
    $scope.setPickerName = function(pickerName) {
        $scope.pickerName = pickerName;
    }
    
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
                $scope.getTrip();
            }
        }
    };

    $scope.currency = config.currency + " ";
    $scope.isFirstSort = true;

    $scope.today = new Date();

    $scope.createdDatePicker = {
        startDate: new Date($scope.today.getFullYear(), $scope.today.getMonth(), $scope.today.getDate() - 7),
        endDate: $scope.today
    };
    
    // Generated scope:
    // PickupDatePicker, DropoffDatePicker
    // startPickup, endPickup, startDropoff, endDropoff
    ['Pickup', 'Dropoff'].forEach(function (val) {
        $scope.$watch(
            (val.toLowerCase() + 'DatePicker'),
            function (date) {
                if (date.startDate) { $location.search('start' + val, (new Date(date.startDate)).toISOString()); }
                if (date.endDate) { $location.search('end' + val, (new Date(date.endDate)).toISOString()); }
            }
        );
    });

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
    }

    /**
     * Show export orders modals
     * 
     * @return {void}
     */
    $scope.showExportTrips = function() {
        ngDialog.close();
        return ngDialog.open({
            template: 'exportModal',
            scope: $scope
        });
    }
    
    /**
     * Export normal orders
     * 
     * @return {void}
     */
    $scope.exportTrips = function() {
        $rootScope.$emit('startSpin');
        if ($scope.createdDatePicker.endDate) {
            $scope.createdDatePicker.endDate.setHours(23, 59, 59, 0);
        }
        Services2.exportTrips({
            startDate: $scope.createdDatePicker.startDate,
            endDate: $scope.createdDatePicker.endDate,
        }).$promise.then(function(result) {
            ngDialog.closeAll();
            $rootScope.$emit('stopSpin');
            window.location = config.url + 'trip/download/' + result.data.hash;
        }).catch(function() {
            $rootScope.$emit('stopSpin');
        })
    }

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
            $scope.steps = [];
            $scope.steps.push($scope.step);
            $scope.steps = $scope.steps.concat(data.tripSteps);
        });
    };

    getDefaultValues();

    /**
     * Assign status to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseStatus = function(item) {
        $location.search('status', item.value);
        $scope.status = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getTrip(); 
    }

    /**
     * Assign status to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseStep = function(item) {
        $scope.step = item;
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

        var paramsQuery = {
            'tripNumber': 'queryTripNumber',
            'pickup': 'queryPickup',
            'dropoff': 'queryDropoff',
            'driver': 'queryDriver',
            'containerNumber': 'queryContainerNumber',
            'district': 'queryDistrict',
            'sortBy': 'sortBy',
            'sortCriteria': 'sortCriteria'
        };
        lodash.each(paramsQuery, function (val, key) {
            $scope[val] = $location.search()[key] || $scope[val];
        });

        var paramsValue = {
            'status': 'statuses'
        };
        lodash.each(paramsValue, function (val, key) {
            var value = $location.search()[key] || $scope[key].value;
            $scope[key] = lodash.find($scope[val], { 'value': (parseInt(value)) ? parseInt(value) : value });
        });

        ['Pickup', 'Dropoff'].forEach(function (data) {
            $scope[data.toLowerCase() + 'DatePicker'].startDate = 
                    ($location.search()['start' + data]) ?
                    new Date($location.search()['start' + data]) :
                    $scope[data.toLowerCase() + 'DatePicker'].startDate;
            $scope[data.toLowerCase() + 'DatePicker'].endDate = 
                    ($location.search()['end' + data]) ?
                    new Date($location.search()['end' + data]) :
                    $scope[data.toLowerCase() + 'DatePicker'].endDate;
        });
        
        $scope.isFirstSort = ($location.search().sortBy) ? false : true;
        // exception for offset
        $location.search('offset', $scope.offset);

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
            userOrderNumber: $scope.queryUserOrderNumber,
            fleet: $scope.queryFleet,
            originHub: $scope.queryOriginHub,
            destinationHub: $scope.queryDestinationHub,
            step: $scope.step.value,
            sortBy: $scope.sortBy,
            sortCriteria: $scope.sortCriteria,
        }
        Services2.getTrip(params).$promise.then(function(data) {
            $scope.displayed = data.data.rows;
            $scope.displayed.forEach(function (val, index, array) {
                array[index].Step = '';
                if (val.OriginHub && val.DestinationHub) {
                    array[index].Step = $scope.steps[2].key;
                } else if (val.DestinationHub) {
                    array[index].Step = $scope.steps[3].key;
                } else if (val.OriginHub) {
                    array[index].Step = $scope.steps[1].key;
                }
            });
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    var variables = {
        'Trip': {
            model: 'queryTripNumber',
            param: 'tripNumber'
        },
        'Container': {
            model: 'queryContainerNumber',
            param: 'containerNumber'
        },
        'District': {
            model: 'queryDistrict',
            param: 'district'
        },
        'Driver': {
            model: 'queryDriver',
            param: 'driver'
        },
        'Pickup': {
            model: 'queryPickup',
            param: 'pickup'
        },
        'Dropoff': {
            model: 'queryDropoff',
            param: 'dropoff'
        }
    };

    // Generates:
    // searchTrip, searchContainer, searchDistrict, searchDriver,
    // searchPickup, searchDropoff
    lodash.each(variables, function (val, key) {
        $scope['search' + key] = function(event){
            if ((event && event.keyCode === 13) || !event) {
                $location.search(val.param, $scope[val.model]);
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                $scope.getTrip();
            }
        };
    });

    /**
     * Add search user order number
     * 
     * @return {void}
     */
    $scope.reqSearchUserOrderNumber = '';
    $scope.searchOrder = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchUserOrderNumber = $scope.queryUserOrderNumber;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getTrip();
        };
    }

    /**
     * Add search fleet
     * 
     * @return {void}
     */
    $scope.searchFleet = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getTrip();
        };
    }

    /**
     * Add search Origin Hub
     * 
     * @return {void}
     */
    $scope.searchOriginHub = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getTrip();
        };
    }

    /**
     * Add search Destination Hub
     * 
     * @return {void}
     */
    $scope.searchDestinationHub = function(event) {
        if ((event && event.keyCode === 13) || !event) {
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
        $location.search('sortBy', sortBy);
        $location.search('sortCriteria', sortCriteria);
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
        $scope.tableState = state;
        if ($scope.isFirstLoaded) {
            $scope.tableState.pagination.start = $scope.offset;
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        $scope.getStatus().then($scope.getTrip);
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
            if ($scope.trip.OriginHub && $scope.trip.DestinationHub) {
                $scope.trip.Step = 'Interhub';
            } else if ($scope.trip.OriginHub) {
                $scope.trip.Step = 'First Leg';
            } else if ($scope.trip.DestinationHub) {
                $scope.trip.Step = 'Last Leg';
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

    /**
     * Clear Filter
     * 
     * @return {void}
     */
    $scope.clearFilter = function(item) {
        $state.reload();
    }
    
  });
