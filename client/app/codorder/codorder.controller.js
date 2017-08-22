'use strict';

angular.module('adminApp')
    .controller('CODOrderCtrl', 
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
            SweetAlert,
            $document,
            $timeout,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.isFirstSort = true;
    $scope.queryMultipleEDS = '';
    $scope.orderNotFound = 0;
    $scope.isOrderSelected = false;
    $scope.orders = [];
    $scope.$watch(
        'queryMultipleEDS',
        function (newValue) {
            // Filter empty line(s)
            $scope.userOrderNumbers = [];
            newValue.split('\n').forEach(function (val) {
                var result = val.replace(/^\s+|\s+$/g, '');
                if (result) {
                    $scope.userOrderNumbers.push(result);
                }
            });
        }
    );

    $scope.status = {
        key: 'All',
        value: 'All'
    };
    $scope.codPaymentStatus = {
        key: 'All',
        value: 'All'
    };
    $scope.codPaymentStatuses = [
        {key: 'All', value: 'All'},
        {key: 'Paid', value: 'Paid'},
        {key: 'Paid to Vendor', value: 'PaidToVendor'},
        {key: 'Unpaid', value: 'Unpaid'}
    ]

    $scope.pickupDatePicker = {
        startDate: $location.search().startPickup || null,
        endDate: $location.search().endPickup || null
    };

    $scope.dropoffDatePicker = {
        startDate: $location.search().startDropoff || null,
        endDate: $location.search().endDropoff || null
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
                $scope.getOrder();
            }
        }
    };

    $scope.currency = config.currency + " ";
    $scope.isFirstSort = true;

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

    $scope.clearTextArea = function () {
        $scope.queryMultipleEDS = '';
        $scope.orderNotFound = 0;
        if ($scope.userOrderNumbers.length > 0) {
            $scope.userOrderNumbers = [];
            $scope.getOrder();
        }
    };

    $scope.filterMultipleEDS = function () {
        var isFilterEDS = true;
        $scope.offset = 0;
        $scope.getOrder(isFilterEDS);
    };

    // Here, model and param have same naming format
    var pickedVariables = {
        'Status': {
            model: 'status',
            pick: 'value',
            collection: 'statuses'
        },
        'CodPaymentStatus': {
            model: 'codPaymentStatus',
            pick: 'value',
            collection: 'codPaymentStatuses'
        }
    };

    // Generates
    // chooseStatus, chooseCodPaymentStatus
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
     * Process order from backend to add some attributes
     */
    function processOrder(o){
        if (o.UserTrackOrders && o.UserTrackOrders.length > 0){
            var t = _.find(o.UserTrackOrders, function(t){ return t.OrderStatus.OrderStatus == 'DELIVERED'});
            if (t){
                o.DeliveredTime = t.CreatedDate;
            }
        }
        if (o.DeliveredTime && (!o.CODPaymentUserOrder || o.CODPaymentUserOrder.CODPayment.Status != 'Paid')){
            o.DaysUnpaid = moment().diff(moment(o.DeliveredTime), 'days');
            if (o.DaysUnpaid < 1){
                o.UnpaidClass = 'bg-info';
            } else if (o.DaysUnpaid < 3){
                o.UnpaidClass = 'bg-warning';
            } else {
                o.UnpaidClass = 'bg-danger';
            }
        }
    }

    /**
     * Get all trips
     * 
     * @return {void}
     */
    $scope.getOrder = function(isFilterEDS) {
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
            'id': 'queryUserOrderNumber',
            'user': 'queryUser',
            'driver': 'queryDriver',
            'fleet': 'queryFleetManager'
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
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            userOrderNumber: $scope.queryUserOrderNumber,
            driver: $scope.queryDriver,
            user: $scope.queryUser,
            fleetManager: $scope.queryFleetManager,
            pickup: $scope.queryPickup,
            dropoff: $scope.queryDropoff,
            status: $scope.status.value,
            codPaymentStatus: $scope.codPaymentStatus.value,
            startPickup: $scope.pickupDatePicker.startDate,
            endPickup: $scope.pickupDatePicker.endDate,
            startDropoff: $scope.dropoffDatePicker.startDate,
            endDropoff: $scope.dropoffDatePicker.endDate,
            sortBy: $scope.sortBy,
            sortCriteria: $scope.sortCriteria,
            userOrderNumbers: JSON.stringify($scope.userOrderNumbers)
        }
        if (isFilterEDS) {
            $scope.orderNotFound = 0;
        }
        Services2.getCODOrder(params).$promise.then(function(data) {
            // modify data, add DeliveredTime
            _.each(data.data.rows, processOrder);
            $scope.displayed = data.data.rows;
            $scope.orders = data.data.rows;
            $scope.orderFound = data.data.count;
            if (isFilterEDS) {
                $scope.orderNotFound = $scope.userOrderNumbers.length - $scope.orderFound;
            }
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    var variables = {
        'Order': {
            model: 'queryUserOrderNumber',
            param: 'id'
        },
        'User': {
            model: 'queryUser',
            param: 'user'
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
        },
        'FleetManager': {
            model: 'queryFleetManager',
            param: 'fleet'
        }
    };

    // Generates:
    // searchOrder, searchUser, searchDriver, searchPickup, searchDropoff,
    // searchFleetManager
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
        window.location = '/codorder/details/' + id;
    };

    /**
     * Get single trip
     * 
     * @return {void}
     */
    $scope.getOrderDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.orderID;
        Services2.getCODOrderDetails({
            id: $scope.id,
        }).$promise.then(function(data) {
            processOrder(data.data);
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
     *  export orders csv
     */
    $scope.exportCsv = function(){
        $rootScope.$emit('startSpin');
        var params = {
            userOrderNumbers: JSON.stringify($scope.userOrderNumbers),
            userOrderNumber: $scope.queryUserOrderNumber,
            driver: $scope.queryDriver,
            user: $scope.queryUser,
            fleetManager: $scope.queryFleetManager,
            pickup: $scope.queryPickup,
            dropoff: $scope.queryDropoff,
            status: $scope.status.value,
            codPaymentStatus: $scope.codPaymentStatus.value,
            startPickup: $scope.pickupDatePicker.startDate,
            endPickup: $scope.pickupDatePicker.endDate,
            startDropoff: $scope.dropoffDatePicker.startDate,
            endDropoff: $scope.dropoffDatePicker.endDate,
        };
        var filename = 'codorders.csv';
        $http.get(config.url + 'codorder/export/csv', {
            params: params
        }).success(function(data){
            $rootScope.$emit('stopSpin');
            var blob = new Blob([data], {
                type: "text/csv;charset=UTF-8;"
            });
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', window.URL.createObjectURL(blob));
            downloadLink.attr('download', filename);
            downloadLink.attr('target', '_blank');
            $document.find('body').append(downloadLink);
            $timeout(function () {
                downloadLink[0].click();
                downloadLink.remove();
            }, null);
        }).error(function(){

        });
    };

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
     * Set all seleted order to scope
     */
    function setSelectedOrder () {
        $scope.selectedOrders = [];
        $scope.orders.forEach(function (order) {
            if (order.Selected) {
                $scope.selectedOrders.push(order);
            }
        });
    }

    $scope.cannotMarkAsPaidToVendor = function (order) {
        if (order) {
            var checked = false;
            if (!order.CODPaymentUserOrder) {
                checked = true;
            }
            if (order.CODPaymentUserOrder && order.CODPaymentUserOrder.CODPayment && order.CODPaymentUserOrder.CODPayment.Status == 'Paid') {
                checked = true;
            }
            if (order.CODPaymentUserOrder && order.CODPaymentUserOrder.CODPayment && order.CODPaymentUserOrder.CODPayment.Status == 'PaidToVendor') {
                checked = true;
            }
            return checked;
        }
    }

    $scope.createMarkAsPaidToVendor = function () {
        ngDialog.close();
        $rootScope.$emit('startSpin');
        var orderIDs = [];
        lodash.forEach($scope.selectedOrders, function (val) {
            orderIDs.push(val.UserOrderID);
        });

        Services2.bulkMarkAsPaidToVendor({
            orderIDs: orderIDs
        }).$promise
        .then(function(data) {
            $rootScope.$emit('stopSpin');
            var failedResponse = '';
            if (data.data.failed.length > 0) {
                failedResponse += '\n Success '+ data.data.success + ' Orders';
                failedResponse += '\n Error '+ data.data.error + ' Orders :';
                lodash.forEach(data.data.failed, function (failed) {
                    if (!failed.success) {
                        failedResponse += '\n' + failed.error;
                    }
                })
            }
            SweetAlert.swal('Success', 'Mark as Paid to Vendor' + failedResponse, 'success');
            $state.reload();
        })
        .catch(function (e) {
            $rootScope.$emit('stopSpin');
            SweetAlert.swal('Error', e.data.error.message, 'error');
        });
    }

    /**
     * Show modal when action button triggered
     * @param  {Object} dataOnModal - target, title, validation
     * @return {void}
     */
    $scope.showModalOnAction = function (dataOnModal) {
        $scope.dataOnModalAction = dataOnModal;

        if (dataOnModal.validation) {
            var checked = false;
            $scope.orders.some(function(order) {
                if (order.Selected && dataOnModal.validation(order)) {
                    checked = true;
                    return;
                }
            });

            if (checked) {
                SweetAlert.swal('Error', 'You have selected one or more orders which cannot be \n' + dataOnModal.title, 'error');
                return false;
            }
        }

        if (dataOnModal.target == 'markAsPaidToVendor') {
            
        }

        ngDialog.close();
        return ngDialog.open({
            template: dataOnModal.target,
            scope: $scope,
            className: 'ngdialog-theme-default',
            width: dataOnModal.width || '50%',
            closeByDocument: false
        });
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
    
  });
