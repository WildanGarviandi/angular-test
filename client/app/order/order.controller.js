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
            $q,
            SweetAlert
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.itemsByPage = 10;
    $scope.offset = 0;
    $scope.queryMultipleEDS = '';
    $scope.orderNotFound = [];

    $scope.status = {
        key: 'All',
        value: 'All'
    };

    $scope.pickupType = {
        key: 'All',
        value: 'All'
    };
    $scope.pickupTypes = [$scope.pickupType];

    $scope.orderType = {
        key: 'All',
        value: 'All'
    };
    $scope.orderTypes = [$scope.orderType];

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
    $scope.decimalSeparator = config.decimalSeparator;
    $scope.zipLength = config.zipLength;
    $scope.reassignableOrderStatus = config.reassignableOrderStatus;
    $scope.notCancellableOrderStatus = config.notCancellableOrderStatus;

    $scope.isFirstSort = true;

    $scope.companies = [{
        CompanyDetailID: 'all',
        CompanyName: 'All (search by name)'
    }];

    $scope.newDeliveryFee = 0;
    $scope.isUpdateDeliveryFee = false;
    $scope.createdDatePicker = {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7),
        endDate: new Date()
    };

    $scope.maxExportDate = new Date();
 
    $scope.isStartDatePicker = false;
    $scope.isEndDatePicker = false;
    $scope.$watch(
        'queryMultipleEDS',
        function (newValue) {
            // Filter empty line(s)
            $scope.userOrderNumbers = newValue.split('\n').filter(function (val) {
                return (val);
            });
        }
    );

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
            $scope.pickupTypes = $scope.pickupTypes.concat(data.pickupTypes);
            $scope.orderTypes = $scope.orderTypes.concat(data.orderTypes);
        });
    };

    getDefaultValues();

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
     * Assign pickup type to the chosen item
     * 
     * @return {void}
     */
    $scope.choosePickupType = function(item) {
        $scope.pickupType = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getOrder(); 
    };

    $scope.chooseOrderType = function ($item) {
        $scope.orderType = $item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getOrder(); 
    };

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
            userOrderNumber: $scope.queryUserOrderNumber,
            userOrderNumbers: JSON.stringify($scope.userOrderNumbers),
            driver: $scope.queryDriver,
            merchant: $scope.queryMerchant,
            pickup: $scope.queryPickup,
            sender: $scope.querySender,
            dropoff: $scope.queryDropoff,
            pickupType: $scope.pickupType.value,
            deviceType: $scope.orderType.value,
            recipient: $scope.queryRecipient,
            status: $scope.status.value,
            startPickup: $scope.pickupDatePicker.startDate,
            endPickup: $scope.pickupDatePicker.endDate,
            startDropoff: $scope.dropoffDatePicker.startDate,
            endDropoff: $scope.dropoffDatePicker.endDate,
            sortBy: $scope.sortBy,
            sortCriteria: $scope.sortCriteria,
        }
        Services2.getOrder(params).$promise.then(function(data) {
            $scope.orderFound = data.data.count;
            $scope.displayed = data.data.rows;
            $scope.displayed.forEach(function (val, index, array) {
                array[index].PickupType = (lodash.find($scope.pickupTypes, {value: val.PickupType})).key;
                if (val.DeviceType && val.DeviceType.DeviceTypeID === 7) {
                    array[index].OrderType = (lodash.find($scope.orderTypes, {value: 7})).key;
                } else {
                    array[index].OrderType = (lodash.find($scope.orderTypes, {value: 1})).key;
                }
                if (val.WebstoreUser) {
                    array[index].CustomerName = val.WebstoreUser.FirstName + ' ' + val.WebstoreUser.LastName;
                } else {
                    array[index].CustomerName = val.User.FirstName + ' ' + val.User.LastName;
                }
            });
            $rootScope.$emit('stopSpin');
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
        });
    }

    /**
     * Get all order that exist on multiple EDS / WebOrderID searching
     * @return void
     */
    var getExistOrder = function () {
        Services2.getExistOrder({
            userOrderNumbers: JSON.stringify($scope.userOrderNumbers)
        }).$promise.then(function (result) {
            $scope.orderNotFound = [];
            result.data.forEach(function (order) {
                if (!order.exist) {
                    $scope.orderNotFound.push(order.key);
                }
            });
        });
    };

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
     * Add search merchant
     * 
     * @return {void}
     */
    $scope.searchMerchant = function(event) {
        if ((event && event.keyCode === 13) || !event) {
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
     * Add search by sender name or phone number or email
     * 
     * @return {void}
     */
    $scope.searchSender = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getOrder();
        };
    }

    /**
     * Add search by recipient name or phone number or email
     * 
     * @return {void}
     */
    $scope.searchRecipient = function(event) {
        if ((event && event.keyCode === 13) || !event) {
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
            $scope.canBeReturned = ($scope.order.OrderStatus.OrderStatusID === 15);
            $scope.canBeCopied = ($scope.order.OrderStatus.OrderStatusID === 13);
            $scope.canBeReassigned = false;
            $scope.reassignableOrderStatus.forEach(function (status) {
                if ($scope.order.OrderStatus.OrderStatusID === status) { $scope.canBeReassigned = true; }
            });
            $scope.canBeCancelled = true;
            $scope.notCancellableOrderStatus.forEach(function (status) {
                if ($scope.order.OrderStatus.OrderStatusID === status) { $scope.canBeCancelled = false; }
            });
            if (!$scope.canBeCopied && !$scope.canBeReassigned && !$scope.canBeCancelled) {
                $scope.noAction = true;
            }
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
        $rootScope.$emit('startSpin');
        if (address === 'pickup') {
            var params = $scope.order.PickupAddress;
        } else if (address === 'dropoff') {
            var params = $scope.order.DropoffAddress;
        }
        
        Services2.getZipcodes({
            search: params.ZipCode
        }).$promise
        .then(function(response, error) {
            if (response.data.Zipcodes.rows.length === 0) {
                alert('Zipcode not valid');
                $rootScope.$emit('stopSpin');
            } else {
                Services2.updateAddress({
                    id: params.UserAddressID,
                }, params).$promise.then(function(response, error) {
                    $rootScope.$emit('stopSpin');
                    alert('Update address success');
                    ngDialog.closeAll();
                    $scope.loadDetails();
                })
            }
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
     * Change order status to RETURN_CUSTOMER
     * 
     */
    $scope.returnCustomer = function () {
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You will return this order to customer / sender ? This process can't be reversed.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Return this order",
        }, function (isConfirm) { 
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                return Services2.returnCustomer({
                    id: $scope.order.UserOrderID
                }, {}).$promise.then(function (result) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal('Order returned to sender');
                    $state.reload();
                }).catch(function (e) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal('Failed in returning order to sender', e.data.error.message);
                    $state.reload();
                });
            } else {
                $rootScope.$emit('stopSpin');
            }
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
            SweetAlert.swal({
                title: "Order copied", 
                text: "Redirect to new copied order"
            }, function () {
                $location.path('/order/details/' + result.data.newOrder.UserOrderID);
            });
            
        }).catch(function (e) {
            $rootScope.$emit('stopSpin');
            SweetAlert.swal('Failed in copying order', e.data.error.message);
            $state.reload();
        });
    };

    /**
     * Cancel the order
     * @return void
     */
    $scope.cancelOrder = function () {
        SweetAlert.swal({
            title: 'Are you sure?',
            text: "Cancel this order?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm){ 
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                Services2.cancelOrder({
                    id: $scope.order.UserOrderID
                }, {}).$promise.then(function (result) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal('Order cancelled');
                    $scope.order.OrderStatus = result.data.order.OrderStatus;
                    $state.reload();
                }).catch(function (e) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal('Failed in cancelling order', e.data.error.message);
                    $state.reload();
                });
            }
        });
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
     * @param  {Object} params - get params
     * @return void
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

    var getWebstores = function () {
        return Services2.getWebstores().$promise.then(function (result) {
            $scope.merchants = result.data.webstores.map(function (val) {
                return val.webstore.FirstName + ' ' + val.webstore.LastName;
            });
        });
    };
    getWebstores();

    /**
     * Show export orders modals
     * 
     * @return {void}
     */
    $scope.showExportOrders = function() {
        ngDialog.close()
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
    $scope.exportNormalOrders = function() {
        $rootScope.$emit('startSpin');
        if ($scope.createdDatePicker.endDate) {
            $scope.createdDatePicker.endDate.setHours(23,59,59,0);
        }
        Services2.exportNormalOrders({
            startDate: $scope.createdDatePicker.startDate,
            endDate: $scope.createdDatePicker.endDate,
        }).$promise.then(function(result) {
            ngDialog.closeAll();
            $rootScope.$emit('stopSpin');
            window.location = config.url + 'order/download/' + result.data.hash;
        }).catch(function() {
            $rootScope.$emit('stopSpin');
        })
    }

    /**
     * Export uploadable orders
     * 
     * @return {void}
     */
    $scope.exportUploadableOrders = function() {
        $rootScope.$emit('startSpin');
        if ($scope.createdDatePicker.endDate) {
            $scope.createdDatePicker.endDate.setHours(23,59,59,0);
        }
        Services2.exportUploadableOrders({
            startDate: $scope.createdDatePicker.startDate,
            endDate: $scope.createdDatePicker.endDate,
        }).$promise.then(function(result) {
            ngDialog.closeAll();
            $rootScope.$emit('stopSpin');
            window.location = config.url + 'order/download/' + result.data.hash;
        }).catch(function() {
            $rootScope.$emit('stopSpin');
        })
    }

    /**
     * Export completed orders
     * 
     * @return {void}
     */
    $scope.exportCompletedOrders = function() {
        $rootScope.$emit('startSpin');
        if ($scope.createdDatePicker.endDate) {
            $scope.createdDatePicker.endDate.setHours(23,59,59,0);
        }
        Services2.exportCompletedOrders({
            startDate: $scope.createdDatePicker.startDate,
            endDate: $scope.createdDatePicker.endDate,
        }).$promise.then(function(result) {
            ngDialog.closeAll();
            $rootScope.$emit('stopSpin');
            window.location = config.url + 'order/download/' + result.data.hash;
        }).catch(function() {
            $rootScope.$emit('stopSpin');
        })
    }

    /**
     * Get all zipcodes
     * 
     * @return {void}
     */
    $scope.getZipcodes = function(val) {
        return Services2.getZipcodes({
            search: val
        }).$promise.then(function(response){
            return response.data.Zipcodes.rows.map(function(item){
                return item.ZipCode;
            });
        });
    };

    /**
     * Call getAllDrivers function when a company is choosen
     * @param  {[type]} company [description]
     * @return {Object} promise of data of all drivers
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
     * Pass driver, fleet manager and delivery fee value to request to reassign the order
     * @param  {[type]} driver [description]
     * @return {[type]}        [description]
     */
    $scope.selectDriver = function (driver) {
        var params = {
            driverID : driver.Driver.UserID,
            fleetManagerID: driver.Driver.Driver.CompanyDetail.CompanyDetailID,
            deliveryFee: ($scope.isUpdateDeliveryFee) ? $scope.newDeliveryFee : null,
        };
        $rootScope.$emit('startSpin');
        ngDialog.close();
        Services2.reassignDriver({
            id: $scope.order.UserOrderID
        }, params).$promise.then(function (result) {
            $rootScope.$emit('stopSpin');
            SweetAlert.swal('Order reassigned');
            $state.reload();
        })
        .catch(function (e) {
            $rootScope.$emit('stopSpin');
            SweetAlert.swal('Failed in cancelling order', e.data.error.message);
            $state.reload();
        });
    };

    /**
     * Get all user data on searching by name
     * @param  {[type]} val [description]
     * @return {[type]}     [description]
     */
    $scope.getCustomers = function (val) {
        var userLimit = 50;
        return Services2.getUsers({
            search: val,
            limit: userLimit
        }).$promise.then(function (result) {
            return result.data.Users.map(function (user) {
                return user.FirstName + ' ' + user.LastName;
            });
        });
    };

    $scope.clearTextArea = function () {
        $scope.queryMultipleEDS = '';
        $scope.orderNotFound = [];
        if ($scope.userOrderNumbers.length > 0) {
            $scope.userOrderNumbers = [];
            $scope.getOrder();
        }
    };

    $scope.filterMultipleEDS = function () {
        getExistOrder();
        $scope.getOrder();
    };

});
