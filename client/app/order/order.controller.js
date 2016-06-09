'use strict';

angular.module('adminApp')
    .controller('OrderCtrl', 
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
            ngDialog,
            $q
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
                $scope.getOrder();
            }
        }
    };

    $scope.currency = config.currency + " ";
    $scope.zipLength = config.zipLength;
    $scope.isFirstSort = true;

    $scope.companies = [{
        CompanyDetailID: 'all',
        CompanyName: 'All (search by name)'
    }];

    $scope.newDeliveryFee = 0;
    $scope.isUpdateDeliveryFee = false;

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
        $scope.getOrder(); 
    }

    /**
     * Get all orders
     * 
     * @return {void}
     */
    $scope.getOrder = function() {
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
            userOrderNumber: $scope.reqSearchUserOrderNumber,
            driver: $scope.reqSearchDriver,
            pickup: $scope.reqSearchPickup,
            dropoff: $scope.reqSearchDropoff,
            status: $scope.status.value,
            startPickup: $scope.pickupDatePicker.startDate,
            endPickup: $scope.pickupDatePicker.endDate,
            startDropoff: $scope.dropoffDatePicker.startDate,
            endDropoff: $scope.dropoffDatePicker.endDate,
            sortBy: $scope.sortBy,
            sortCriteria: $scope.sortCriteria,
        }
        Services2.getOrder(params).$promise.then(function(data) {
            $scope.displayed = data.data.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

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
            $scope.getOrder();
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
            $scope.getOrder();
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
            $scope.getOrder();
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
            $scope.getOrder();
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
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getOrder();
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
        $scope.getOrder();
        $scope.isFirstLoaded = true;
    }

    $scope.pickerFocus = function() {
        focus('date-picker');
    };

    $scope.detailsPage = function(id) {
        window.location = '/order/details/' + id;
    };

    /**
     * Get single order
     * 
     * @return {void}
     */
    $scope.getOrderDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.orderID;
        Services2.getOrderDetails({
            id: $scope.id,
        }).$promise.then(function(data) {
            $scope.order = data.data;
            switch ($scope.order.PickupType) {
                case 1:
                    $scope.order.PickupType = 'Now';
                    break;        
                case 2:
                    $scope.order.PickupType = 'Later';
                    break;    
                case 3:
                    $scope.order.PickupType = 'On Demand';
                    break;    
                default:
                    $scope.order.PickupType = '-';
            }
            $scope.canBeCopied = ($scope.order.OrderStatus.OrderStatusID === 13);
            $scope.canBeReassigned = (  $scope.order.OrderStatus.OrderStatusID === 6 ||
                                        $scope.order.OrderStatus.OrderStatusID === 15);
            $scope.order.PaymentType = ($scope.order.PaymentType === 2) ? 'Wallet' : 'Cash';
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
        if ($stateParams.orderID !== undefined) {
            $scope.getOrderDetails();
        }
    }

    $scope.loadDetails();
    $scope.isCollapsed = true;

    /**
     * Show edit pickup address
     * 
     * @return {void}
     */
    $scope.editPickupAddress = function() {
        var editPickupAddressDialog = ngDialog.open({
            template: 'editPickupAddressTemplate',
            scope: $scope,
            className: 'ngdialog-theme-default edit-pickup-address-popup'
        });
    };

    /**
     * Show edit dropoff address
     * 
     * @return {void}
     */
    $scope.editDropoffAddress = function() {
        var editDropoffAddressDialog = ngDialog.open({
            template: 'editDropoffAddressTemplate',
            scope: $scope,
            className: 'ngdialog-theme-default edit-dropoff-address-popup'
        });
    };

    /**
     * Update address
     * 
     * @return {void}
     */
    $scope.updateAddress = function(address) {
        if (address === 'pickup') {
            var params = $scope.order.PickupAddress;
            if (isNaN($scope.order.PickupAddress.ZipCode)) {
                alert('Pickup zipcode is not valid');
                return;
            }
        } else if (address === 'dropoff') {
            var params = $scope.order.DropoffAddress;
            if (isNaN($scope.order.DropoffAddress.ZipCode)) {
                alert('Dropoff zipcode is not valid');
                return;
            }
        }
        $rootScope.$emit('startSpin');
        Services2.updateAddress({
            id: params.UserAddressID,
        }, params).$promise.then(function(response, error) {
            $rootScope.$emit('stopSpin');
            alert('Update address success');
            ngDialog.closeAll();
            $scope.loadDetails();
        })
        .catch(function(error) {
            $rootScope.$emit('stopSpin');
            alert('Update address failed');
        });
    }

    /**
     * Get all countries
     * 
     * @return {void}
     */
    $scope.getCountries = function(val) {
        return Services2.getCountries({
            search: val
        }).$promise.then(function(response){
            return response.data.Countries.rows.map(function(item){
                return item.Name;
            });
        });
    };

    /**
     * Get all states
     * 
     * @return {void}
     */
    $scope.getStates = function(val) {
        return Services2.getStates({
            search: val
        }).$promise.then(function(response){
            return response.data.States.rows.map(function(item){
                return item.Name;
            });
        });
    };

    /**
     * Get all cities
     * 
     * @return {void}
     */
    $scope.getCities = function(val) {
        return Services2.getCities({
            search: val,
            status: 'all'
        }).$promise.then(function(response){
            return response.data.Cities.rows.map(function(item){
                return item.Name;
            });
        });
    };

    /**
     * Make a request to copy the details of the order and copy it to a new order, then
     *     redirect to that order
     * @return void
     */
    $scope.copyCancelledOrder = function () {
        $rootScope.$emit('startSpin');
        Services2.copyCancelledOrder({
            id: $scope.order.UserOrderID
        }, {}).$promise.then(function (result) {
            $rootScope.$emit('stopSpin');
            $location.path('/order/details/' + result.data.newOrder.UserOrderID);
        }).catch(function (e) {
            alert('Copy order was failed.\n' + e.data.error.message);
            $state.reload();
            $rootScope.$emit('stopSpin');
        });
    };

    /**
     * Cancel the order
     * @return void
     */
    $scope.cancelOrder = function () {
        if (confirm('Are you sure to cancel this order ?')) {
            $rootScope.$emit('startSpin');
            Services2.cancelOrder({
                id: $scope.order.UserOrderID
            }, {}).$promise.then(function (result) {
                alert('Cancelling order was success');
                $scope.order.OrderStatus = result.data.order.OrderStatus;
                $rootScope.$emit('stopSpin');
            }).catch(function (e) {
                alert('Cancel order was failed.\n' + e.data.error.message);
                $state.reload();
                $rootScope.$emit('stopSpin');
            });
        }
    };

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
                $scope.companies = $scope.companies.concat(companies);
                $scope.company = $scope.companies[0];
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get all drivers for reassign feature
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    var getAllDrivers = function (params) {
        $scope.isLoading = true;
        return $q(function (resolve) {
            Services2.getDrivers(params).$promise.then(function(result) {
                params.limit = result.data.Drivers.count;
                Services2.getDrivers(params).$promise.then(function(result) {
                    $scope.displayed = result.data.Drivers.rows;
                    $scope.displayed = lodash.sortBy($scope.displayed, function (val) { 
                        return val.Driver.FirstName.toLowerCase(); 
                    });
                    $rootScope.$emit('stopSpin');
                    $scope.isLoading = false;
                    resolve();
                });
            });
        });
    };

    /**
     * Reassign order to new driver
     * @return void
     */
    $scope.reassignDriver = function () {
        $rootScope.$emit('startSpin');
        getCompanies()
        .then(function () {
            ngDialog.open({
                template: 'reassignDriverTemplate',
                scope: $scope,
                className: 'ngdialog-theme-default reassign-driver-popup'
            });
        });
    };

    /**
     * Call getAllDrivers function when a company is choosen
     * @param  {[type]} company [description]
     * @return {[type]}         [description]
     */
    $scope.chooseCompany = function (company) {
        $scope.company = company;
        if (company.CompanyDetailID !== 'all') {
            var params = {
                offset: 0,
                limit: 0,
                status: 'All',
                codStatus: 'all',
                company: company.CompanyDetailID
            };
            getAllDrivers(params);
        }
    };

    /**
     * Call getAllDrivers function when user searching it by name
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    $scope.searchDriverName = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            var params = {
                offset: 0,
                limit: 0,
                status: 'All',
                codStatus: 'all',
                company: 'all',
                name: $scope.queryDriverName
            };
            getAllDrivers(params);
        }
    };

    /**
     * [selectDriver description]
     * @param  {[type]} driver [description]
     * @return {[type]}        [description]
     */
    $scope.selectDriver = function (driver) {
        var params = {
            driverID : driver.Driver.UserID,
            fleetManagerID: driver.Driver.Driver.CompanyDetail.CompanyDetailID,
            deliveryFee: ($scope.isUpdateDeliveryFee) ? $scope.newDeliveryFee : null,
        };
        Services2.reassignDriver({
            id: $scope.order.UserOrderID
        }, params).$promise.then(function (result) {
            alert('Reassigning driver was success');
            $state.reload();
            ngDialog.close();
        })
        .catch(function (e) {
            alert('Reassign driver was failed.\n' + e.data.error.message);
            $state.reload();
            ngDialog.close();
        });
    };

  });
