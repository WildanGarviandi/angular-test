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
            Webstores,
            Upload,
            $q,
            SweetAlert,
            $httpParamSerializer,
            $cookies,
            $timeout
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.isFirstSort = true;

    $scope.queryMultipleEDS = '';
    $scope.orderNotFound = [];
    $scope.defaultFilter = {};
    $scope.isDefaultFilterActive = true;

    $scope.isImportTypeDefault = true;

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

    $scope.isAttempt = {
        key: 'All',
        value: 'All'
    };

    $scope.isAttempts = [
        {
            key: 'All',
            value: 'All'
        }, {
            key: 'Yes',
            value: 1,
        }, {
            key: 'No',
            value: 0,
        }
    ];

    $scope.pickupDatePicker = {
        startDate: $location.search().startPickup || null,
        endDate: $location.search().endPickup || null
    };

    $scope.dropoffDatePicker = {
        startDate: $location.search().startDropoff || null,
        endDate: $location.search().endDropoff || null
    };

    $scope.form = {};
    
    $scope.cutOffTime = null;

    $scope.dueTime = null;

    $scope.firstAttemptDatePicker = {
        startDate: null,
        endDate: null
    };

    $scope.secondAttemptDatePicker = {
        startDate: null,
        endDate: null
    };

    $scope.importedDatePicker = moment().add(1, 'hours').toDate();
    $scope.importedDatePickerNow = moment().add(1, 'hours').format('dddd, MMM Do HH:mm');

    $scope.dataTemporary = [];
    $scope.showMerchantListOnImport = false;
    $scope.showFleetListOnImport = false;
    $scope.readyForPickupOnImport = false;

    $scope.drivers = [];
    $scope.isFetchingDrivers = false;
    $scope.urlToDownload = {};
    $scope.urlToDownload.templateDeliveryAttempts = '../../assets/template/importUserOrderAttempt.xlsx';
    $scope.isNavigationOpen = true;

    /*
     * Style Responsive Height
     *
    */
    var orderNavigationHeight = $('#order-navigation').height();
    var addInitHeight = 260;
    var minInitHeight = 110;
    var externalHeightOnResize = 235;
    $scope.tableHeight = $window.innerHeight - (orderNavigationHeight + addInitHeight);
    $scope.orderListHeight = $scope.tableHeight - minInitHeight;
    $(window).resize(function(){
        $scope.$apply(function(){
            orderNavigationHeight = $('#order-navigation').height();
            $scope.tableHeight = $window.innerHeight - (orderNavigationHeight + externalHeightOnResize);
            $scope.orderListHeight = $scope.tableHeight - minInitHeight;
        });
    });

    $scope.toggleOrderNavigation = function() {
        $scope.isNavigationOpen = !$scope.isNavigationOpen;
        var addHeight = 190;
        if ($scope.isNavigationOpen) {
            $scope.tableHeight = $window.innerHeight - (addInitHeight + orderNavigationHeight);
        } else {
            $scope.tableHeight = $window.innerHeight - addHeight;
        }
        $scope.orderListHeight = $scope.tableHeight - minInitHeight;
    }

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
                $scope.getOrder();
            }
        }
    };

    $scope.beforeRender = function($dates){
        var minDate = new Date().setHours(0,0,0,0);
        for(var d in $dates){         
            if($dates[d].utcDateValue < minDate){
                $dates[d].selectable = false;
            }
        }
    };

    $scope.currency = config.currency + " ";
    $scope.decimalSeparator = config.decimalSeparator;
    $scope.zipLength = config.zipLength;
    $scope.reassignableOrderStatus = config.reassignableOrderStatus;
    $scope.notCancellableOrderStatus = config.notCancellableOrderStatus;
    $scope.deliverableOrderStatus = config.deliverableOrderStatus;
    $scope.reassignableFleet = config.reassignableFleet;
    $scope.reassignableDriver = config.reassignableDriver;
    $scope.updatablePrice = config.updatablePrice;
    $scope.features = config.features;
    $scope.returnableWarehouse = config.returnableWarehouse;
    $scope.returnableSender = config.returnableSender;
    $scope.defaultReturnReason = config.defaultReturnReason;
    $scope.canChangeToPickup = config.canChangeToPickup;

    $scope.newDeliveryFee = 0;
    $scope.isUpdateDeliveryFee = false;
    $scope.createdDatePicker = {
        startDate: moment().subtract(7, "days").format("YYYY-MM-DD"),
        endDate: new Date()
    };
    $scope.exportDatePicker = false;

    $scope.maxExportDate = new Date();
 
    $scope.isStartDatePicker = false;
    $scope.isEndDatePicker = false;
    $scope.$watch(
        'queryMultipleEDS',
        function (newValue) {
            // Filter empty line(s)
            $scope.userOrderNumbers = newValue.split(/\s+/).filter(function (val) {
                return val;
            });
        }
    );

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

    $scope.orders = [];
    $scope.newPrice = 0;
    $scope.limitPages = [$scope.itemsByPage, 25, 50, 100, 200];
    $scope.isOrderSelected = false;
    $scope.techSupport = $cookies.get('techSupport') === 'true';

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
            $scope.pickupTypes = $scope.pickupTypes.concat(data.pickupTypes);
            $scope.orderTypes = $scope.orderTypes.concat(data.userTypes);
            $scope.marketplaceType = (lodash.find($scope.orderTypes, {key: 'Marketplace'}));
            $scope.ecommerceType = (lodash.find($scope.orderTypes, {key: 'Ecommerce'}));
            $scope.currentRouteOrderStatus = data.currentRouteOrderStatus;
        });
    };

    getDefaultValues();

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
        'Status': {
            model: 'status',
            pick: 'value',
            collection: 'statuses'
        },
        'PickupType': {
            model: 'pickupType',
            pick: 'value',
            collection: 'pickupTypes'
        },
        'OrderType': {
            model: 'orderType',
            pick: 'value',
            collection: 'orderTypes'
        },
    };

    // Generates
    // chooseStatus, choosePickupType, chooseOrderType
    lodash.each(pickedVariables, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getOrder(); 
        };
    });

    /**
     * Assign merchant to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseMerchant = function(item) {
        $scope.merchant = item;
    }

    /**
     * Assign Failed Attempt to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseisAttempt = function ($item) {
        $scope.isAttempt = $item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getOrder(); 
    };

    function checkUrlLengthIsValid(url, params, length) {
        var urls = config.url + url + '?' + $httpParamSerializer(params);
        var isValid = true;
        if (urls.length > length) {
            isValid = false;
        }
        return isValid;
    }

    /**
     * Get all orders
     * 
     * @return {void}
     */
    $scope.getOrder = function() {
        $rootScope.$emit('startSpin');  

        var paramsQuery = {
            'id': 'queryUserOrderNumber',
            'pickup': 'queryPickup',
            'sender': 'querySender',
            'dropoff': 'queryDropoff',
            'recipient': 'queryRecipient',
            'fleet': 'queryFleet',
            'driver': 'queryDriver',
            'merchant': 'queryMerchant',
            'sortBy': 'sortBy',
            'sortCriteria': 'sortCriteria'
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
        var params = $scope.getFilterParam();
        if (!checkUrlLengthIsValid('order', params, 2047)) {
            $rootScope.$emit('stopSpin');
            return SweetAlert.swal('Error', 'too many filters', 'error');
        }
        Services2.getOrder(params).$promise.then(function(data) {
            $scope.orderFound = data.data.count;
            $scope.displayed = data.data.rows;
            $scope.orders = data.data.rows;
            $scope.displayed.forEach(function (val, index, array) {
                array[index].PickupType = (lodash.find($scope.pickupTypes, {value: val.PickupType})).key;
                if (val.User && val.User.UserType && $scope.marketplaceType.value.indexOf(val.User.UserType.UserTypeID) > -1) {
                    array[index].OrderType = $scope.marketplaceType.key;
                } else {
                    array[index].OrderType = $scope.ecommerceType.key;
                }
                if (val.WebstoreUser) {
                    array[index].CustomerName = val.WebstoreUser.FirstName + ' ' + val.WebstoreUser.LastName;
                } else {
                    array[index].CustomerName = val.User.FirstName + ' ' + val.User.LastName;
                }

                array[index].Attempt = [];
                if (val.UserOrderAttempts.length > 0) {
                    array[index].IsAttempt = 'Yes';
                    for (var i=0; i <= 1; i++) {
                        if (val.UserOrderAttempts[i]) {
                            array[index].Attempt[i] = val.UserOrderAttempts[i].CreatedDate;
                        } else {
                            array[index].Attempt[i] = '-';
                        }
                    }
                } else {
                    array[index].IsAttempt = 'No';
                    for (var i=0; i <= 1; i++) {
                        array[index].Attempt[i] = '-';
                    }
                }

                array[index].CurrentRouteDetail = '-';
                if (val.CurrentRoute && val.CurrentRoute.OrderStatus) {
                    var route = val.CurrentRoute;
                    var origin = ((route.OriginHub && route.OriginHub.Name) || "Merchant");
                    var destination = ((route.DestinationHub && route.DestinationHub.Name) || "Dropoff");

                    if ($scope.currentRouteOrderStatus.open.indexOf(route.OrderStatus.OrderStatusID) > -1) {
                        array[index].CurrentRouteDetail = "Still on " + origin
                    } else if ($scope.currentRouteOrderStatus.processed.indexOf(route.OrderStatus.OrderStatusID) > -1) {
                        array[index].CurrentRouteDetail = "From" + origin + "On the way to " + destination
                    } else {
                        array[index].CurrentRouteDetail = "Arrived at " + destination
                    }
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

    var variables = {
        'Order': {
            model: 'queryUserOrderNumber',
            param: 'id'
        },
        'Driver': {
            model: 'queryDriver',
            param: 'driver'
        },
        'Merchant': {
            model: 'queryMerchant',
            param: 'merchant'
        },
        'Pickup': {
            model: 'queryPickup',
            param: 'pickup'
        },
        'Dropoff': {
            model: 'queryDropoff',
            param: 'dropoff'
        },
        'Sender': {
            model: 'querySender',
            param: 'sender'
        },
        'Recipient': {
            model: 'queryRecipient',
            param: 'recipient'
        },
        'Fleet': {
            model: 'queryFleet',
            param: 'fleet'
        }
    };

    // Generates:
    // searchOrder, searchDriver, searchMerchant, searchPickup, searchDropoff,
    // searchSender, searchRecipient, searchFleet
    lodash.each(variables, function (val, key) {
        $scope['search' + key] = function(event){
            if ((event && event.keyCode === 13) || !event) {
                $location.search(val.param, $scope[val.model]);
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                $scope.getOrder();
            }
        };
    });

    /**
     * Add search CuttOffTime
     * 
     * @return {void}
     */
    $scope.searchCutOffTime = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getOrder();
        };
    }

    /**
     * Add search DueTime
     * 
     * @return {void}
     */
    $scope.searchDueTime = function(event) {
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
        $location.search('sortBy', sortBy);
        $location.search('sortCriteria', sortCriteria);
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
        $scope.tableState = state;
        if ($scope.isFirstLoaded) {
            $scope.tableState.pagination.start = $scope.offset;
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        $scope.getStatus().then($scope.getOrder);
    }

    $scope.pickerFocus = function() {
        focus('date-picker');
    };

    $scope.detailsPage = function(id) {
        $window.open('/order/details/' + id);
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
            $scope.order.PickupType = (lodash.find($scope.pickupTypes, {value: $scope.order.PickupType})).key;
            $scope.canBeReturned = ($scope.order.OrderStatus.OrderStatusID === 15 && $scope.features.order.return_sender);
            $scope.canBeCopied = ($scope.order.OrderStatus.OrderStatusID === 13 && $scope.features.order.copy_cancelled);
            $scope.canBeReassigned = false;
            $scope.reassignableOrderStatus.forEach(function (status) {
                if ($scope.order.OrderStatus.OrderStatusID === status && $scope.features.order.reassign_driver) { 
                    $scope.canBeReassigned = true; 
                }
            });
            $scope.canBeCancelled = true;
            $scope.notCancellableOrderStatus.forEach(function (status) {
                if ($scope.order.OrderStatus.OrderStatusID === status || !$scope.features.order.cancel) { 
                    $scope.canBeCancelled = false; 
                }
            });
            $scope.canBeDelivered = false;
            $scope.deliverableOrderStatus.forEach(function (status) {
                if ($scope.order.OrderStatus.OrderStatusID === status && $scope.features.order.mark_delivered) {
                    $scope.canBeDelivered = true; 
                }
            });           
            if (!$scope.canBeCopied && 
                !$scope.canBeReassigned && 
                !$scope.canBeCancelled &&
                !$scope.canBeDelivered) {
                $scope.noAction = true;
            }
            $scope.order.PaymentType = ($scope.order.PaymentType === 2) ? 'Wallet' : 'Cash';
            $scope.order.CurrentRouteDetail = '-';
            if ($scope.order.CurrentRoute && $scope.order.CurrentRoute.OrderStatus) {
                var route = $scope.order.CurrentRoute;
                var origin = ((route.OriginHub && route.OriginHub.Name) || "Merchant");
                var destination = ((route.DestinationHub && route.DestinationHub.Name) || "Dropoff");

                if ($scope.currentRouteOrderStatus.open.indexOf(route.OrderStatus.OrderStatusID) > -1) {
                    $scope.order.CurrentRouteDetail = "Still on " + origin
                } else if ($scope.currentRouteOrderStatus.processed.indexOf(route.OrderStatus.OrderStatusID) > -1) {
                    $scope.order.CurrentRouteDetail = "From" + origin + "On the way to " + destination
                } else {
                    $scope.order.CurrentRouteDetail = "Arrived at " + destination
                }
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
        if ($stateParams.orderID !== undefined) {
            $scope.getOrderDetails();
        }
    }

    $scope.loadDetails();
    $scope.isCollapsed = true;

    /**
     * Show import button modal
     * 
     * @return {void}
     */
    $scope.showImportModal = function() {
        ngDialog.open({
            template: 'importModalTemplate',
            scope: $scope,
            className: 'ngdialog-theme-default edit-pickup-address-popup'
        });
    };

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
     * Show edit COD
     */
    $scope.editCod = function(){
        $scope.form.cod = {
            IsCOD: $scope.order.IsCOD,
            TotalValue: $scope.order.TotalValue
        }
        var editCodDialog = ngDialog.open({
            template: 'editCodTemplate',
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
     * Update IsCOD and TotalValue
     */
    $scope.updateCod = function(){
        $rootScope.$emit('startSpin');
        var params = {
            IsCOD: $scope.form.cod.IsCOD ? true : false,
            TotalValue: $scope.form.cod.TotalValue
        };
        Services2.updateCod({
            id: $scope.order.UserOrderID
        }, params).$promise
        .then(function(response, error){
            $rootScope.$emit('stopSpin');
            alert('Update COD success');
            ngDialog.closeAll();
            $scope.loadDetails();
        })
        .catch(function(error){
            $rootScope.$emit('stopSpin');
            alert('Update COD failed: '+error.data.error.message);
        });
    };

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
     * Get merchant selection
     * 
     * @return {void}
     */
    $scope.getMerchants = function() {
        Webstores.getWebstore().$promise.then(function(data) {
            $scope.merchants = [{
                key: 'Choose Merchant',
                value: '0'
            }];
            data.data.webstores.forEach(function(merchant) {
                $scope.merchants.push({
                    key: merchant.webstore.FirstName + ' ' + merchant.webstore.LastName, 
                    value: merchant.webstore.UserID
                });
                $scope.merchant = $scope.merchants[0];
            });
        });
    }

    /**
     * Fet all hubs data
     * 
     */
    function getHubs () {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            var params = {
                offset: 0
            };
            Services2.getHubs(params).$promise.then(function(data) {
                var hubs = data.data.Hubs.rows;
                $scope.hubs = []; 
                hubs.forEach(function(hub) {
                    $scope.hubs.push({name: hub.Name, id: hub.HubID});
                });
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    }

    /**
     * Show import orders modals
     * 
     * @return {void}
    */
    $scope.showImportOrders = function() {
        $scope.clearMessage();
        $scope.getMerchants();
        getCompanies(true)
        .then(function () {
            ngDialog.close()
            ngDialog.open({
                template: 'importModal',
                scope: $scope,
                className: 'ngdialog-theme-default import-orders'
            });
        });
    }

    /**
     * Show import delivery attempts modals
     * 
     * @return {void}
    */
    $scope.showImportDeliveryAttempts = function() {
        ngDialog.close()
        ngDialog.open({
            template: 'importDeliveryAttemptsModal',
            scope: $scope,
            className: 'ngdialog-theme-default import-orders'
        });
    }

    /**
     * Set imported date picker
     * 
     * @return {void}
    */
    $scope.onTimeSet = function (newDate, oldDate) {
        $scope.importedDatePicker = newDate;
        $scope.importedDatePickerNow = moment(newDate).format('dddd, MMM Do HH:mm');
    }

    /**
     * Check is it using Merchant on import
     * 
     * @return {void}
    */
    $scope.isShowMerchantListOnImport = function() {
        $scope.showMerchantListOnImport = !$scope.showMerchantListOnImport;
    }

    /**
     * Check is it using Fleet on import
     * 
     * @return {void}
    */
    $scope.isShowFleetListOnImport = function() {
        $scope.showFleetListOnImport = !$scope.showFleetListOnImport;
    }

    /**
     * Check is it ready for pickup on import
     * 
     * @return {void}
    */
    $scope.isReadyForPickupOnImport = function() {
        $scope.readyForPickupOnImport = !$scope.readyForPickupOnImport;
    }

    /**
     * Clear message
     * 
     * @return {void}
    */
    $scope.clearMessage = function () {
        $scope.dataTemporary = [];
        $scope.dataTemporary.title = '';
        $scope.uploaded = [];
        $scope.updated = [];
        $scope.importOrderError = [];
    }

    /**
     * Upload orders
     * 
     * @return {void}
    */
    $scope.uploadOrders = function(files) {
        if ($scope.merchant === undefined) {
            alert('Please select merchant');
            return;
        }

        $scope.clearMessage();
        
        var data = {};

        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $scope.dataTemporary.title += file.name;
                data.file = file;
                data.pickupTime = $scope.importedDatePicker;

                if (!file.$error) {
                    $scope.dataTemporary.push(data);
                }
            }
        }
    };

    /**
     * Start upload orders
     * 
     * @return {void}
    */
    $scope.startUpload = function() {
        var url = config.url + 'order/import/xlsx';
        var data = $scope.dataTemporary;

        if (!data.length) {
            return SweetAlert.swal({
                title: 'Error',
                text: 'Please drop excel file',
                type: 'error'
            });
        }

        if ($scope.showMerchantListOnImport && !parseInt($scope.merchant.value)) {
            return SweetAlert.swal({
                title: 'Error',
                text: 'Merchant required',
                type: 'error'
            });
        }

        if ($scope.showFleetListOnImport && !parseInt($scope.fleet.User.UserID)) {
            return SweetAlert.swal({
                title: 'Error',
                text: 'Fleet required',
                type: 'error'
            });
        }

        var successFunction = function (response) {
            response.data.data.forEach(function(order, index){
                var row = index + 2;
                if (order.isCreated) {
                    $scope.uploaded.push(order);
                } else if (order.isUpdated) {
                    $scope.updated.push(order);
                } else {
                    $scope.importOrderError.push({row: row, list: order.error});
                }
            });
        };

        var errorFunction = function(error) {
            var errorMessage = error.data.error.message;
            if (!(errorMessage instanceof Array)) {
                $scope.importOrderError.push({list: [error.data.error.message]});
            }
        };
        
        lodash.forEach(data, function(val) {
            val.merchantID = $scope.merchant.value;
            val.fleetManagerID = $scope.fleet.User.UserID;
            if ($scope.readyForPickupOnImport) {
                val.isReadyForPickup = true;
            }
            doUpload(url, val, successFunction, errorFunction);
        })
    }

    /**
     * General function to import file
     * 
     * @return {void}
    */
    var doUpload = function(url, data, successFunction, errorFunction) {
        $rootScope.$emit('startSpin');
        Upload.upload({
            url: url,
            data: data
        }).then(function(response) {
            $rootScope.$emit('stopSpin');
            $scope.clearMessage();
            successFunction(response);
        }).catch(function(error){
            $rootScope.$emit('stopSpin');
            $scope.clearMessage();
            errorFunction(error);
        });
    }
    
    /*
     * Clear message of delivery attempts
     * 
     * @return {void}
    */
    $scope.clearMessageDeliveryAttempts = function () {
        $scope.uploadedDeliveryAttempts = [];
        $scope.errorUploadDeliveryAttempts = [];
    }

    /**
     * Upload delivery attempts
     * 
     * @return {void}
    */
    $scope.uploadDeliveryAttempts = function(files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!file.$error) {
                    $rootScope.$emit('startSpin');
                    Upload.upload({
                        url: config.url + 'order/import/bulk-report-attempt',
                        data: {
                            file: file
                        }
                    }).then(function(response) {
                        $rootScope.$emit('stopSpin');
                        $scope.clearMessageDeliveryAttempts();
                        if (!response.data.data.Insert) {
                            $scope.errorUploadDeliveryAttempts = {};
                            $scope.errorUploadDeliveryAttempts.isArray = false;
                            var errorMessages = response.data.data.messages;
                            if (!errorMessages) {
                                $scope.errorUploadDeliveryAttempts.isArray = true;
                                errorMessages = response.data.data.message;
                            }
                            $scope.errorUploadDeliveryAttempts.title = response.data.data.title;
                            $scope.errorUploadDeliveryAttempts.message = errorMessages;
                            if ($scope.errorUploadDeliveryAttempts.isArray) {
                                $scope.errorUploadDeliveryAttempts.message = [];
                                errorMessages.forEach(function(errorMessage, index){
                                    $scope.errorUploadDeliveryAttempts.message.push({
                                        row: errorMessage.at_row, 
                                        list: errorMessage.error
                                    });
                                });
                            }
                        }

                        $scope.uploadedDeliveryAttempts = {};
                        $scope.uploadedDeliveryAttempts.insert = response.data.data.Insert;
                        $scope.uploadedDeliveryAttempts.update = response.data.data.Update;
                    }).catch(function(error){
                        $rootScope.$emit('stopSpin');
                        $scope.clearMessageDeliveryAttempts();
                    });
                }
            }
        }
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
     * @param  {boolean} withAllOption - if true, will add 'All' option or 'no fleet'
     *      
     */
    var getCompanies = function (withAllOption) {
        $scope.companies = [{
            CompanyDetailID: 'all',
            CompanyName: 'All (search by name)'
        }];

        $scope.fleets = [];

        if (withAllOption) {
            $scope.fleets = [{
                User: {
                    UserID: '0'
                },
                CompanyName: 'All'
            }];
        }

        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getAllCompanies().$promise.then(function(result) {
                var companies = lodash.sortBy(result.data.Companies, function (i) { 
                    return i.CompanyName.toLowerCase(); 
                });
                $scope.companies = $scope.companies.concat(companies);
                $scope.company = $scope.companies[0];                
                $scope.fleets = $scope.fleets.concat(companies);
                $scope.fleet = $scope.fleets[0];   
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get all reason return
     * 
     * @return {Object} Promise
     */
    var getReasons = function () {
        $scope.reason = $scope.defaultReturnReason;
        $scope.reasons = [];
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getReasonReturns().$promise.then(function(result) {
                var reasons = lodash.sortBy(result.data, function (i) { 
                    return i.ReasonName.toLowerCase(); 
                });
                $scope.reasons = $scope.reasons.concat(reasons);  
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get all drivers for reassign feature in modal on management page 
     * @param  {Object} params - get params
     * @return void
     */
    var getAllDriversOnModal = function (params) {
        $rootScope.$emit('startSpin');
        Services2.getDrivers(params).$promise.then(function(result) {
            params.limit = result.data.Drivers.count;
            Services2.getDrivers(params).$promise.then(function(result) {
                var drivers = [];
                result.data.Drivers.rows.forEach(function(driver){
                    var driverData = {
                        key: driver.UserID, 
                        value: driver.Driver.FirstName + ' ' + driver.Driver.LastName,
                        fleetManagerID: driver.Driver.Driver.FleetManager.UserID
                    };
                    drivers.push(driverData);
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
        getCompanies(true)
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
    $scope.showExportOrders = function(type) {
        $scope.exportType = type;
        ngDialog.close()
        return ngDialog.open({
            template: 'exportModal',
            scope: $scope
        });
    }

    /**
     * Get Filter Param
     * 
     * @return {void}
     */
    $scope.getFilterParam = function() {
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
        if ($scope.cutOffTime) {
            $scope.cutOffTime = moment($scope.cutOffTime).format('YYYY-MM-DD');
        }
        if ($scope.firstAttemptDatePicker.startDate) {
            $scope.firstAttemptDatePicker.startDate = new Date($scope.firstAttemptDatePicker.startDate);
            $scope.firstAttemptDatePicker.startDate.setHours(
                $scope.firstAttemptDatePicker.startDate.getHours() - $scope.firstAttemptDatePicker.startDate.getTimezoneOffset() / 60
            );           
        }
        if ($scope.firstAttemptDatePicker.endDate) {
            $scope.firstAttemptDatePicker.endDate = new Date($scope.firstAttemptDatePicker.endDate);
            $scope.firstAttemptDatePicker.endDate.setHours(
                $scope.firstAttemptDatePicker.endDate.getHours() - $scope.firstAttemptDatePicker.endDate.getTimezoneOffset() / 60
            );
        }
        if ($scope.secondAttemptDatePicker.startDate) {
            $scope.secondAttemptDatePicker.startDate = new Date($scope.secondAttemptDatePicker.startDate);
            $scope.secondAttemptDatePicker.startDate.setHours(
                $scope.secondAttemptDatePicker.startDate.getHours() - $scope.secondAttemptDatePicker.startDate.getTimezoneOffset() / 60
            );           
        }
        if ($scope.secondAttemptDatePicker.endDate) {
            $scope.secondAttemptDatePicker.endDate = new Date($scope.secondAttemptDatePicker.endDate);
            $scope.secondAttemptDatePicker.endDate.setHours(
                $scope.secondAttemptDatePicker.endDate.getHours() - $scope.secondAttemptDatePicker.endDate.getTimezoneOffset() / 60
            );
        }        
        if ($scope.dueTime) {
            $scope.dueTime = moment($scope.dueTime).format('YYYY-MM-DD'); 
        }
        
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
            userType: $scope.orderType.key,
            recipient: $scope.queryRecipient,
            status: $scope.status.value,
            startPickup: $scope.pickupDatePicker.startDate,
            endPickup: $scope.pickupDatePicker.endDate,
            startDropoff: $scope.dropoffDatePicker.startDate,
            endDropoff: $scope.dropoffDatePicker.endDate,
            cutOffTime: $scope.cutOffTime,
            dueTime: $scope.dueTime,
            isAttempt: $scope.isAttempt.value,
            startFirstAttempt: $scope.firstAttemptDatePicker.startDate, 
            endFirstAttempt: $scope.firstAttemptDatePicker.endDate, 
            startSecondAttempt: $scope.secondAttemptDatePicker.startDate, 
            endSecondAttempt: $scope.secondAttemptDatePicker.endDate, 
            fleet: $scope.queryFleet,
            sortBy: $scope.sortBy,
            sortCriteria: $scope.sortCriteria,
        };

        if (lodash.isEmpty($scope.defaultFilter)) {
            $scope.defaultFilter = params;
        } else {
            $scope.isDefaultFilterActive = false;
        }

        return params;
    }

    /**
     * Get Export Filter Param
     * 
     * @return {void}
     */
    $scope.getExportParam = function() {
        var params = {
            userOrderNumber: $scope.queryUserOrderNumber,
            userOrderNumbers: JSON.stringify($scope.userOrderNumbers),
            driver: $scope.queryDriver,
            merchant: $scope.queryMerchant,
            pickup: $scope.queryPickup,
            sender: $scope.querySender,
            dropoff: $scope.queryDropoff,
            pickupType: $scope.pickupType.value,
            userType: $scope.orderType.key,
            recipient: $scope.queryRecipient,
            status: $scope.status.value,
            startPickup: $scope.pickupDatePicker.startDate,
            endPickup: $scope.pickupDatePicker.endDate,
            startDropoff: $scope.dropoffDatePicker.startDate,
            endDropoff: $scope.dropoffDatePicker.endDate,
            cutOffTime: $scope.cutOffTime,
            dueTime: $scope.dueTime,
            isAttempt: $scope.isAttempt.value,
            startFirstAttempt: $scope.firstAttemptDatePicker.startDate, 
            endFirstAttempt: $scope.firstAttemptDatePicker.endDate, 
            startSecondAttempt: $scope.secondAttemptDatePicker.startDate, 
            endSecondAttempt: $scope.secondAttemptDatePicker.endDate,
            fleet: $scope.queryFleet,
            sortBy: $scope.sortBy,
            sortCriteria: $scope.sortCriteria,
        };

        return params;
    }
    
    var httpSaveBlob = function(url, params, type, fileName){
        var style = '<link rel="stylesheet" href="app/app.css">';

        var output = '<div class="circleSpinnerloader" style="margin-top: 50px; margin-bottom: 50px">'+
                        '<div class="loadersanimation"></div>'+
                    '</div>'+
                    '<p style="text-align: center">You can do other things, while exporting in progress</p>';

        var popout = window.open();
            popout.document.write(style+output);

        $http({
            url: config.url + url,
            method: "GET",
            params: params,
            headers: {
                'Content-type': 'application/json',
                'Accept': type
            },
            responseType: 'arraybuffer'
        }).then(function(response) {

            var blob = new Blob([response.data], { type: type });

            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                var URL = window.URL || window.webkitURL;
                var downloadUrl = window.URL.createObjectURL(blob);

                if (fileName) {
                    // use HTML5 a[download] attribute to specify filename
                    var a = document.createElement("a");
                    if (typeof a.download === 'undefined') {
                        popout.location.href = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = fileName;
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {
                    popout.location.href = downloadUrl;
                }

                setTimeout(function () { 
                    window.URL.revokeObjectURL(downloadUrl); 
                    popout.close();
                }, 1000); // cleanup
            }
        }).catch(function (e) {
            $rootScope.$emit('stopSpin');
            SweetAlert.swal('Download Failed ', e.statusText);
        });
    }

    /**
     * Export orders with Date or All Orders
     * 
     * @return {void}
     */
    $scope.exportOrdersByDate = function(type, isDateActive) {
        ngDialog.close();
        var params = $scope.getExportParam();

        if (isDateActive) {
            if ($scope.createdDatePicker.endDate) {
                $scope.createdDatePicker.endDate.setHours(23,59,59,0);
            };

            params.startDate = $scope.createdDatePicker.startDate;
            params.endDate = $scope.createdDatePicker.endDate;
        }

        if (type === 'normal') {
            var url = 'order/export/normal';
        } else if (type === 'uploadable') {
            var url = 'order/export/uploadable';
        } else if (type === 'completed') {
            var url = 'order/export/completed';
        }
        
        var fileName = 'export_'+ moment(new Date()).format('YYYY-MM-DD HH:mm:ss') +'.xlsx';
        var type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
           
        return httpSaveBlob(url, params, type, fileName);
    }

    /**
     * Export orders
     * 
     * @return {void}
     */
    $scope.exportOrders = function(type) {
        var defaultFilter = $scope.defaultFilter;
        delete defaultFilter['limit'];
        delete defaultFilter['offset'];

        var params = $scope.getExportParam();

        if ($scope.isDefaultFilterActive || lodash.isEqual(defaultFilter, params)) {
            return $scope.showExportOrders(type);
        }

        if (type === 'normal') {
            var url = 'order/export/normal';
        } else if (type === 'uploadable') {
            var url = 'order/export/uploadable';
        } else if (type === 'completed') {
            var url = 'order/export/completed';
        }

        
        var fileName = 'export_'+ moment(new Date()).format('YYYY-MM-DD HH:mm:ss') +'.xlsx';
        var type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
           
        return httpSaveBlob(url, params, type, fileName);
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
     * Call getAllDrivers function when a company is choosen
     * @param  {[type]} company [description]
     * @return {Object} promise of data of all drivers
     */
    $scope.chooseCompanyReturnDrivers = function (company) {
        $scope.drivers = [];
        $scope.isFetchingDrivers = true;
        var params = {
            offset: 0,
            limit: 0,
            status: 'All',
            codStatus: 'all',
            company: 'all'
        };
        if (company && company.CompanyName !== 'All') {
            $scope.fleet = company;
            params.company = company.CompanyDetailID;
        }
        return getAllDriversOnModal(params);
    };

    $scope.chooseDriver = function (driver) {
        $scope.driver = driver;
    }

    /**
     * Choose company on import orders
     * @param  {[type]} company [description]
     * @return {void}
     */
    $scope.chooseCompanyOnModals = function (company) {
        $scope.fleet = company;
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
            fleetManagerID: driver.Driver.Driver.FleetManager.UserID,
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
            SweetAlert.swal('Failed in reassigning order', e.data.error.message);
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

    /**
     * Set an order status to DELIVERED
     *
     * @return {void}
     */
    $scope.setDeliveredStatus = function () {
        SweetAlert.swal({
            title: 'Are you sure?',
            text: "Mark as DELIVERED?",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm) {
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                Services2.bulkSetDeliveredStatus({
                    orderIDs: [$scope.order.UserOrderID]
                }).$promise.then(function (result) {
                    if (result.data.error) {
                        throw {
                            data: {
                                error: {
                                    message: result.data.error[0].error.message
                                }
                            }
                        }
                    }
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal('Order status changed');
                    $state.reload();
                }).catch(function (e) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal({
                            title: 'Failed in marking status as DELIVERED', 
                            text: e.data.error.message, 
                            type: "error"
                    }, function (isConfirm) {
                        if (isConfirm) {
                            $state.reload();
                        }
                    });
                });
            }
        });
    }

    /**
     * Set multiple order status to DELIVERED
     * @return {void}
     */
    $scope.bulkSetDeliveredStatus = function () {
        var totalSelected = 0;
        var orderIDs = [];
        var prohibitedIDs = [];
        $scope.displayed.forEach(function (val) {
            if (val.Selected) { 
                // Check if status can be mark as delivered
                if ($scope.deliverableOrderStatus.indexOf(val.OrderStatus.OrderStatusID) >= 0) {
                    totalSelected++; 
                    orderIDs.push(val.UserOrderID);
                } else {
                    prohibitedIDs.push(val);
                }
            }
        });
        if (prohibitedIDs.length === 0 && totalSelected) {
            SweetAlert.swal({
                title: 'Are you sure?',
                text: "Mark as DELIVERED for " + totalSelected + " orders ?",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: 'No'
            }, function (isConfirm) {
                if (isConfirm) {
                    $rootScope.$emit('startSpin');
                    Services2.bulkSetDeliveredStatus({
                        orderIDs: orderIDs
                    }).$promise.then(function (result) {
                        if (result.data.error) {
                            var messages = '<table align="center">';
                            result.data.error.forEach(function (e) {
                                messages += '<tr><td class="text-right">' + e.UserOrderNumber + 
                                            ' : </td><td class="text-left"> ' + e.error.message + '</td></tr>';
                            })
                            messages += '</table>';
                            throw {
                                data: {
                                    message: result.data.message,
                                    error: {
                                        message: messages
                                    }
                                }
                            }
                        }
                        $rootScope.$emit('stopSpin');
                        SweetAlert.swal('Orders status changed');
                        $state.reload();
                    }).catch(function (e) {
                        $rootScope.$emit('stopSpin');
                        SweetAlert.swal({
                            title: (e.data.message) ? e.data.message : 'Failed in marking status as DELIVERED', 
                            text: e.data.error.message, 
                            type: "error",
                            html: true,
                            customClass: 'alert-big'
                        }, function (isConfirm) {
                            if (isConfirm) {
                                $state.reload();
                            }
                        });
                    });
                }
            });
        } else if (prohibitedIDs.length > 0) {
            var messages = '';
            if (prohibitedIDs.length > 1) {
                messages += 'These orders have status which are prohibited <table align="center">';
            } else {
                messages += 'This order has status which is prohibited <table align="center">';
            }
            prohibitedIDs.forEach(function (e) {
                messages += '<tr><td class="text-right">' + e.UserOrderNumber + 
                            ' : </td><td class="text-left"> ' + e.OrderStatus.OrderStatus + '</td></tr>';
            })
            messages += '</table>';
            SweetAlert.swal({
                title: 'Can not mark as DELIVERED',
                text: messages,
                type: 'error',
                html: true
            });
        } else {
            SweetAlert.swal('No orders selected');
        }
    }

    /**
     * Select all or unselect all orders.
     * 
     * @return {void}
     */
    $scope.checkUncheckSelected = function() {
        $scope.orders.forEach(function(order) {
            order.Selected = $scope.status.selectedAll;
        });
        $scope.prepareSelectedOrders();
    };
 
    /**
     * Check whether there is one or more orders selected.
     * 
     * @return {boolean}
     */
    $scope.selectedOrderExists = function() {
        var checked = false;
        $scope.orders.some(function(order) {
            if (order.Selected) {
                checked = true;
                return;
            }
        });
 
        return checked;
    };
 
    /**
     * Prepare selected orders.
     * 
     * @return {array}
     */
    $scope.prepareSelectedOrders = function() {            
        var selectedOrders = [];
        $scope.orders.forEach(function (order) {
            if (order.Selected) {
                selectedOrders.push(order);
            }
        });
 
        $scope.selectedOrders = selectedOrders;

        $scope.isOrderSelected = false;
        if ($scope.selectedOrderExists()) {
            $scope.isOrderSelected = true;
        }
    };

    /**
     * Check whether there is one or more orders with non-updatable price selected.
     * 
     * @return {boolean}
     */
    $scope.selectedNonUpdatablePriceExists = function() {
        var checked = false;
        $scope.orders.some(function(order) {
            if (order.Selected && $scope.updatablePrice.indexOf(order.OrderStatus.OrderStatusID) === -1) {
                checked = true;
                return;
            }
        });
 
        return checked;
    };

    /**
     * Check whether there is one or more non-reassignable orders selected.
     * 
     * @return {boolean}
     */
    $scope.selectedNonReassignableExists = function() {
        var checked = false;
        $scope.orders.some(function(order) {
            if (order.Selected && $scope.reassignableFleet.indexOf(order.OrderStatus.OrderStatusID) === -1) {
                checked = true;
                return;
            }
        });
 
        return checked;
    };
    
    /**
     * Check whether there is one or more non-reassignable orders selected.
     * 
     * @return {boolean}
     */
    $scope.selectedNonReassignableDriverExists = function() {
        var checked = false;
        $scope.orders.some(function(order) {
            if (order.Selected && $scope.reassignableDriver.indexOf(order.OrderStatus.OrderStatusID) === -1) {
                checked = true;
                return;
            }
        });
 
        return checked;
    };

    /**
     * Check whether there is one or more orders with cannot be returned to warehouse selected.
     * 
     * @return {boolean}
     */
    $scope.selectedNonReturnWarehouseExists = function() {
        var checked = false;
        $scope.orders.some(function(order) {
            if (order.Selected && $scope.returnableWarehouse.indexOf(order.OrderStatus.OrderStatusID) === -1) {
                checked = true;
                return;
            }
        });
 
        return checked;
    };

    /**
     * Check whether there is one or more orders with cannot be returned to sender selected.
     * 
     * @return {boolean}
     */
    $scope.selectedNonReturnSenderExists = function() {
        var checked = false;
        $scope.orders.some(function(order) {
            if (order.Selected && $scope.returnableSender.indexOf(order.OrderStatus.OrderStatusID) === -1) {
                checked = true;
                return;
            }
        });
 
        return checked;
    };

    /**
     * Show set price modals
     * 
     * @return {void}
    */
    $scope.showSetPrice = function() {
        if ($scope.selectedNonUpdatablePriceExists()) {
            SweetAlert.swal('Error', 'You have selected one or more orders which cannot be updated', 'error');
            return false;
        }
        ngDialog.close()
        return ngDialog.open({
            template: 'setPriceModal',
            scope: $scope,
            className: 'ngdialog-theme-default set-price'
        });
    }

    /**
     * Show reassign fleet modals
     * 
     * @return {void}
    */
    $scope.showReassignFleet = function() {
        if ($scope.selectedNonReassignableExists()) {
            SweetAlert.swal('Error', 'You have selected one or more orders which cannot be reassigned', 'error');
            return false;
        }
        getCompanies(true)
        .then(function () {
            ngDialog.close();
            return ngDialog.open({
                template: 'reassignFleetModal',
                scope: $scope,
                className: 'ngdialog-theme-default reassign-fleet'
            });
        });
    }

    /**
     * Show reassign fleet modals
     * 
     * @return {void}
    */
    $scope.showReassignDriver = function() {
        if ($scope.selectedNonReassignableDriverExists()) {
            var allowedStatus = '';
            lodash.each($scope.statuses, function (val, key) {
                if ($scope.reassignableDriver.indexOf(val.value) !== -1) {
                    allowedStatus += ' '+val.key;
                }
            });
            SweetAlert.swal({
                title: 'Error',
                text: 'You have selected one or more orders which cannot be reassigned <br><br> Allowed Status <br>'+allowedStatus,
                html: true,
                type: 'error'
            });
            return false;
        }
        $rootScope.$emit('startSpin');
        
        getCompanies()
        .then($scope.chooseCompanyReturnDrivers)
        .then(function () {
            ngDialog.close();
            $rootScope.$emit('stopSpin');
            return ngDialog.open({
                template: 'reassignDriverModal',
                scope: $scope,
                className: 'ngdialog-theme-default reassign-fleet'
            });
        });
    }

    /**
     * Show set return warehouse modals
     * 
     * @return {void}
    */
    $scope.showReturnWarehouse = function() {
        if ($scope.selectedNonReturnWarehouseExists()) {
            SweetAlert.swal('Error', 'You have selected one or more orders which cannot be returned to warehouse', 'error');
            return false;
        }

        $scope.returnedOrders = [];
        var selectedOrders = lodash.filter($scope.orders, { 'Selected': true });
        selectedOrders.forEach(function(order) {
            $scope.returnedOrders.push({OrderID: order.UserOrderID, ReasonID: $scope.defaultReturnReason.ReasonID});
        });

        $scope.chooseReasonOnModals = function (reason, orderID) {
            var matchedOrder = lodash.find($scope.returnedOrders, { 'OrderID': orderID });
            if (matchedOrder) {
                matchedOrder.ReasonID = reason.ReasonID;
            }
        };

        getReasons()
        .then(function () {
            ngDialog.close();
            return ngDialog.open({
                template: 'setReturnWarehouseModal',
                scope: $scope,
                className: 'ngdialog-theme-default reassign-fleet'
            });
        });
    }

    /**
     * Bulk set return warehouse
     * 
     * @return {void}
     */
    $scope.bulkReturnWarehouse = function() {
        SweetAlert.swal({
            title: 'Are you sure?',
            text: "Set status to return warehouse for these orders?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm){ 
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                ngDialog.closeAll();
                Services2.bulkSetReturnWarehouse({
                    orders: $scope.returnedOrders
                }).$promise.then(function (result) {
                    var messages = '<table align="center" style="font-size: 12px;">';
                    result.data.forEach(function (o) {
                        messages += '<tr><td class="text-right">' + o.UserOrderNumber + 
                                    ' : </td><td class="text-left"> ' + o.message + '</td></tr>';
                    })
                    messages += '</table>';
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal({
                        title: 'Mark as Returned Warehouse', 
                        text: messages,
                        html: true,
                        customClass: 'alert-big'
                    });
                    $state.reload();
                });
            }
        });
    }

    /**
     * Show set return sender modals
     * 
     * @return {void}
    */
    $scope.showReturnSender = function() {
        if ($scope.selectedNonReturnSenderExists()) {
            SweetAlert.swal('Error', 'You have selected one or more orders which cannot be returned to sender', 'error');
            return false;
        }

        $scope.returnedSenderOrders = [];
        var selectedOrders = lodash.filter($scope.orders, { 'Selected': true });
        selectedOrders.forEach(function(order) {
            $scope.returnedSenderOrders.push(order.UserOrderID);
        });

        ngDialog.close();
        return ngDialog.open({
            template: 'setReturnSenderModal',
            scope: $scope,
            className: 'ngdialog-theme-default reassign-fleet'
        });
    }

    /**
     * Bulk set return sender
     * 
     * @return {void}
     */
    $scope.bulkReturnSender = function() {
        SweetAlert.swal({
            title: 'Are you sure?',
            text: "Set status to return sender for these orders?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm){ 
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                ngDialog.closeAll();
                Services2.bulkSetReturnSender({
                    orderIDs: $scope.returnedSenderOrders
                }).$promise.then(function (result) {
                    var messages = '<table align="center" style="font-size: 12px;">';
                    result.data.forEach(function (o) {
                        messages += '<tr><td class="text-right">' + o.UserOrderNumber + 
                                    ' : </td><td class="text-left"> ' + o.message + '</td></tr>';
                    })
                    messages += '</table>';
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal({
                        title: 'Mark as Returned Sender', 
                        text: messages,
                        html: true,
                        customClass: 'alert-big'
                    });
                    $state.reload();
                });
            }
        });
    }

    /**
     * Bulk set price
     * 
     * @return {void}
     */
    $scope.setPrice = function() {
        var regexNumber = /^[0-9]+$/;
        if ((!regexNumber.test($scope.newPrice)) || ($scope.newPrice < 0)) {
            SweetAlert.swal('Error', 'Price must be a positive number', 'error');
            return false;
        }
        var orderIDs = []
        $scope.selectedOrders.forEach(function(order) {
            orderIDs.push(order.UserOrderID);
        });
        SweetAlert.swal({
            title: 'Are you sure?',
            text: "Set price of these orders?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm){ 
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                Services2.bulkSetPrice({
                    orderIDs: orderIDs,
                    price: $scope.newPrice
                }).$promise.then(function (result) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal(result.data.length + ' orders updated');
                    ngDialog.closeAll();
                }).catch(function (e) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal('Failed in setting price', e.data.error.message);
                    $state.reload();
                });
            }
        });
    }

    /**
     * Bulk reassign fleet
     * 
     * @return {void}
     */
    $scope.reassignFleet = function() {
        var orderIDs = []
        $scope.selectedOrders.forEach(function(order) {
            orderIDs.push(order.UserOrderID);
        });
        SweetAlert.swal({
            title: 'Are you sure?',
            text: "Reassign fleet of these orders?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm){ 
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                Services2.bulkReassignFleet({
                    orderIDs: orderIDs,
                    fleetManagerID: $scope.fleet.User.UserID
                }).$promise.then(function (result) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal(result.data[0] + ' orders updated');
                    ngDialog.closeAll();
                    $state.reload();
                }).catch(function (e) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal('Failed in reassigning fleet', e.data.error.message);
                    $state.reload();
                });
            }
        });
    }

    /**
     * Bulk reassign Driver
     * 
     * @return {void}
     */
    $scope.bulkReassignDriver = function() {
        var orderIDs = [],
            orderNumbers = [];
        $scope.selectedOrders.forEach(function(order) {
            orderIDs.push(order.UserOrderID);
            orderNumbers.push(order.UserOrderNumber);
        });
        SweetAlert.swal({
            title: 'Are you sure?',
            text: "Reassign driver of these orders?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm){ 
            if (isConfirm) {
                ngDialog.close();
                $rootScope.$emit('startSpin');
                var driverName = $scope.driver.value;
                var params = {
                    driverID : $scope.driver.key,
                    fleetManagerID: $scope.driver.fleetManagerID,
                    deliveryFee: ($scope.isUpdateDeliveryFee) ? $scope.newDeliveryFee : null,
                };
                var orders = '(' + orderNumbers.join(", ") + ')';
                orderIDs.reduce(function(p, orderID) {
                    return p.then(function() {
                        return Services2.reassignDriver({
                            id: orderID
                        }, params).$promise.then(function(result) {
                            return result;
                        });
                    });
                }, $q.when(true)).then(function(result) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal({
                        title: "Reassign Drivers", 
                        text: orders + '<br>' + 'successfully reassign to driver ' + driverName,
                        html: true
                    }, function () {
                        ngDialog.closeAll();
                        $state.reload();
                    });
                }, function(err) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal({
                        title: 'Failed in reassigning driver',
                        text: orders + '<br>' + err.data.error.message,
                        html: true
                    }, function(){
                        ngDialog.closeAll();
                    });
                });
            }
        });
    }

    /**
     * Set limit page
     * 
     * @return {void}
     */
    $scope.setLimit = function(item) {
        $location.search('limit', item);
        $scope.itemsByPage = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getOrder(); 
    }

    /**
     * Refresh list with user input request
     * 
     * @return {void}
     */
    $scope.refresh = function(item) {
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getOrder();
    }

    /**
     * Clear Filter
     * 
     * @return {void}
     */
    $scope.clearFilter = function(item) {
        $state.reload();
    }

    /**
     * Set multiple order status to PICKUP
     * @return {void}
     */
    $scope.bulkSetPickupStatus = function () {
        var totalSelected = 0;
        var selectedOrder = 0;
        var orderIDs = [];
        var prohibitedIDs = [];
        $scope.displayed.forEach(function (val) {
            if (val.Selected) { 
                if ($scope.canChangeToPickup.indexOf(val.OrderStatus.OrderStatusID) >= 0) {
                    totalSelected++; 
                    orderIDs.push(val.UserOrderID);
                } else {
                    prohibitedIDs.push(val);
                }
                selectedOrder++;
            }
        });
        if (selectedOrder === 0) {
            SweetAlert.swal('No orders selected');
            return;
        }
        if (prohibitedIDs.length > 0) {            
            var messages = '';
            messages += 'This order has status which is prohibited <table align="center">';
            if (prohibitedIDs.length > 1) {
                messages = 'These orders have status which are prohibited <table align="center">';
            }
            prohibitedIDs.forEach(function (e) {
                messages += '<tr><td class="text-right">' + e.UserOrderNumber + 
                            ' : </td><td class="text-left"> ' + e.OrderStatus.OrderStatus + '</td></tr>';
            })
            messages += '</table>';
            SweetAlert.swal({
                title: 'Can not mark as PICKUP',
                text: messages,
                type: 'error',
                html: true
            });
            return;
        }
        SweetAlert.swal({
            title: 'Are you sure?',
            text: "Mark as PICKUP for " + totalSelected + " orders ?",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm) {
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                Services2.bulkSetPickupStatus({
                    orderIDs: orderIDs
                }).$promise.then(function (result) {
                    if (result.data.error) {
                        var messages = '<table align="center">';
                        result.data.error.forEach(function (e) {
                            messages += '<tr><td class="text-right">' + e.UserOrderNumber + 
                                        ' : </td><td class="text-left"> ' + e.error.message + '</td></tr>';
                        })
                        messages += '</table>';
                        throw {
                            data: {
                                message: result.data.message,
                                error: {
                                    message: messages
                                }
                            }
                        }
                    }
                    $rootScope.$emit('stopSpin');
                    var messages = '<table align="center" style="font-size: 12px;">';
                    result.data.forEach(function (o) {
                        messages += '<tr><td class="text-right">' + o.UserOrderID + 
                                    ' : </td><td class="text-left"> ' + o.message + '</td></tr>';
                    })
                    messages += '</table>';
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal({
                        title: 'Mark as Pickup', 
                        text: messages,
                        html: true,
                        customClass: 'alert-big'
                    });
                    $state.reload();
                }).catch(function (e) {
                    $rootScope.$emit('stopSpin');
                    SweetAlert.swal({
                        title: (e.data.message) ? e.data.message : 'Failed in marking status as PICKUP', 
                        text: e.data.error.message, 
                        type: "error",
                        html: true,
                        customClass: 'alert-big'
                    }, function (isConfirm) {
                        if (isConfirm) {
                            $state.reload();
                        }
                    });
                });
            }
        });
    }


    /**
     * Set all seleted order to scope
     */
    function setSelectedOrder () {
        $scope.selectedOrders = [];
        $scope.displayed.forEach(function (order) {
            if (order.Selected) {
                $scope.selectedOrders.push(order);
            }
        });
    }

    /**
     * Initialize reroute data and open modal
     *
     */
    $scope.openRerouteModal = function () {
        $scope.rerouteData = {
            originHub: {},
            destinationHub: {}
        }
        setSelectedOrder();
        $scope.customFleet = false;
        $scope.customFleetData = {
            sender: '',
            fee: 0,
            transportation: '',
            departureTime: moment().format(),
            arrivalTime: moment().format(),
            receipt: '',
            awbNumber: ''
        }
        $scope.customFleetDateOptions = {
            singleDatePicker: true,
            timePicker: true,
            drops: 'up',
            locale: {
                format: 'MM/DD/YYYY hh:mm A'
            }
        }

        getCompanies(false)
        .then(getHubs)
        .then(function () {
            ngDialog.open({
                template: 'rerouteModal',
                scope: $scope,
                className: 'ngdialog-theme-default reroute-modal',
                closeByDocument: false
            });
        });
    }

    $scope.reroute = function () {
        reroute();
    }

    /**
     * Reroute / redirect order
     * Send to the API
     * 
     */
    function reroute () {
        var orderIDs = [];
        var userOrderNumbers = [];
        $scope.selectedOrders.forEach(function (order) {
            orderIDs.push(order.UserOrderID);
            userOrderNumbers.push(order.UserOrderNumber);
        });
        SweetAlert.swal({
            title: 'Summary',
            text: 'Reroute orders ' + userOrderNumbers.join(', ') + ' from hub ' + $scope.rerouteData.originHub.name +
                    ' to hub ' + $scope.rerouteData.destinationHub.name + 
                    ' by ' + 
                    (($scope.customFleet) ? ('third party logistic ' + $scope.customFleetData.sender) : 
                        ('logistic vendor ' + $scope.fleet.CompanyName)) + ' ? ',
            showCancelButton: true,
            closeOnConfirm: false,
            confirmButtonText: "Yes",
            cancelButtonText: 'No'
        }, function (isConfirm) {
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                Services2.rerouteOrders({
                    userOrderIDs: orderIDs,
                    originHubID: $scope.rerouteData.originHub.id,
                    destinationHubID: $scope.rerouteData.destinationHub.id,
                    fleetID: (!$scope.customFleet) ? $scope.fleet.User.UserID : null,
                    externalTripData: ($scope.customFleet) ? $scope.customFleetData : null
                }).$promise.then(function (result) {
                    $rootScope.$emit('stopSpin');
                    ngDialog.closeAll();
                    SweetAlert.swal({
                        title: "Reroute Succeed!",
                        text: "Order has been reroute to trip with ID " + result.data.tripID + " from Hub " +
                                $scope.rerouteData.originHub.name + " to Hub " + 
                                $scope.rerouteData.destinationHub.name + ".",
                        type: "success"
                    });
                }).catch(function (e) {
                    $rootScope.$emit('stopSpin');
                    ngDialog.closeAll();
                    SweetAlert.swal("Reroute Failed!", 'Please call tech support. Error message: ' + 
                        e.data.error.message, "error");
                });
            }
        });
    }

    /**
     * Upload an image to the cloud, will return a url as a response
     * @param  {File} file - image to be uploaded
     * 
     */
    $scope.uploadPic = function (file) {
        $rootScope.$emit('startSpin');
        if (file) {
            $scope.f = file;
            file.upload = Upload.upload({
                url: config.url + 'upload/picture',
                data: {file: file}
            })
            .then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    if (response.data.data && !response.data.error) {
                        $scope.customFleetData.receipt = response.data.data.Location;
                    } else {
                        alert('Uploading picture failed. Please try again');
                        $scope.errorMsg = 'Uploading picture failed. Please try again';
                    }
                    $rootScope.$emit('stopSpin');
                });
            }, function (response) {
                if (response.status > 0) {
                    $scope.errorMsg = response.status + ': ' + response.data;
                }
                $rootScope.$emit('stopSpin');
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };

    $scope.openTracking = function (UserOrderNumber) {
        Services2.getTrack().$promise.then(function (result) {
            $window.open(config.webtrackingURL + '/?id=' + UserOrderNumber + '&t=' + result.data.token);
        });
    }
    
});
