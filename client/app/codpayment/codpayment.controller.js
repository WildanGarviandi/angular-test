'use strict';
angular.module('adminApp')
    .controller('CODPaymentCtrl', 
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
            $document,
            $timeout,
            SweetAlert,
            ngDialog,
            $q
        ) {
    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });
    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.statuses = [
        {key: 'All', value: ''},
        {key: 'Paid', value: 'Paid'},
        {key: 'Unpaid', value: 'Unpaid'}
    ];
    $scope.status = $scope.statuses[0];
    $scope.userTypes = [
        {key: 'All', value: ''},
        {key: 'Driver', value: 3},
        {key: 'Fleet Manager', value: 4}
    ];
    $scope.userType = $scope.userTypes[0];
    $scope.paymentMethods = [
        {key: 'All', value: ''},
        {key: 'DokuOneCheckout', value: 'DokuOneCheckout'},
        {key: 'Cash', value: 'Cash'},
        {key: 'BankTransfer', value: 'BankTransfer'}
    ];
    $scope.paymentMethod = $scope.paymentMethods[0];
    $scope.createdDatePicker = {
        startDate: $location.search().startCreated || null,
        endDate: $location.search().endCreated || null
    };
    $scope.paidDatePicker = {
        startDate: $location.search().startPaid || null,
        endDate: $location.search().endPaid || null
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
                $scope.getPayment();
            }
        }
    };
    // Generated scope:
    // CreatedDatePicker, PaidDatePicker
    // startDate, endDate
    ['Created', 'Paid'].forEach(function (val) {
        $scope.$watch(
            (val.toLowerCase() + 'DatePicker'),
            function (date) {
                if (date.startDate) { $location.search('start' + val, (new Date(date.startDate)).toISOString()); }
                if (date.endDate) { $location.search('end' + val, (new Date(date.endDate)).toISOString()); }
            }
        );
    });
    
    $scope.currency = config.currency + " ";
    $scope.isFirstSort = true;
    $scope.companies = [];
    $scope.drivers = [];
    $scope.selectedUserID = 0;
    $scope.selectedOrder = {};
    $scope.amountPaid = 0;
    $scope.transactionDate = new Date();
    $scope.transactionTypes = [
        {key: 'Cash', value: 'Cash'},
        {key: 'Bank Transfer', value: 'BankTransfer'}
    ];
    $scope.transactionType = $scope.transactionTypes[0];
    $scope.transactionDetails = '';
    $scope.isFetchingDrivers = false;
    $scope.isFetchingOrders = false;
    $scope.formData = {};
    
    $scope.queryMultipleEDS = '';
    $scope.$watch(
        'queryMultipleEDS',
        function (newValue) {
            // Filter empty line(s)
            $scope.userOrderNumbers = newValue.split('\n').filter(function (val) {
                return val;
            });
        }
    );
    // Here, model and param have same naming format
    var pickedVariables = {
        'Status': {
            model: 'status',
            pick: 'value',
        },
        'PaymentMethod': {
            model: 'paymentMethod',
            pick: 'value'
        },
        'UserType': {
            model: 'userType',
            pick: 'value'
        },
    };
    // Generates
    // chooseStatus, choosePaymentMethod, chooseUsertype
    lodash.each(pickedVariables, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getPayment(); 
        };
    });
    $scope.chooseTransactionType = function(item) {
        $scope.transactionType = item;
    }
    $scope.queryTransactionId = '';
    $scope.queryUser = '';
    function processPayment(payment){
        if (payment.User){
            if (payment.User.UserType.UserTypeID == 3){
                // driver
                payment.User.FullName = payment.User.FirstName+' '+payment.User.LastName;
            } else if (payment.User.UserType.UserTypeID == 4){
                // fleet manager
                payment.User.FullName = payment.User.CompanyDetail.CompanyName;
            } else {
                payment.User.FullName = '';
            }
        }
    }
    /**
     * Get all payment
     * 
     * @return {void}
     */
    $scope.getPayment = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        if ($scope.createdDatePicker.startDate) {
            $scope.createdDatePicker.startDate = new Date($scope.createdDatePicker.startDate);
        }
        if ($scope.createdDatePicker.endDate) {
            $scope.createdDatePicker.endDate = new Date($scope.createdDatePicker.endDate);
        }
        if ($scope.paidDatePicker.startDate) {
            $scope.paidDatePicker.startDate = new Date($scope.paidDatePicker.startDate);
        }
        if ($scope.paidDatePicker.endDate) {
            $scope.paidDatePicker.endDate = new Date($scope.paidDatePicker.endDate);
        }
        var paramsQuery = {
            'id': 'queryTransactionId',
            'user': 'queryUser'
        };
        lodash.each(paramsQuery, function (val, key) {
            $scope[val] = $location.search()[key] || $scope[val];
        });
        var paramsValue = {
            'status': 'statuses',
            'userType': 'userTypes',
            'paymentMethod': 'paymentMethods'
        };
        lodash.each(paramsValue, function (val, key) {
            var value = $location.search()[key] || $scope[key].value;
            $scope[key] = lodash.find($scope[val], { 'value': (parseInt(value)) ? parseInt(value) : value });
        });
        ['Created', 'Paid'].forEach(function (data) {
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
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            transactionId: $scope.queryTransactionId,
            user: $scope.queryUser,
            status: $scope.status.value,
            paymentMethod: $scope.paymentMethod.value,
            userType: $scope.userType.value,
            startCreated: $scope.createdDatePicker.startDate,
            endCreated: $scope.createdDatePicker.endDate,
            startPaid: $scope.paidDatePicker.startDate,
            endPaid: $scope.paidDatePicker.endDate,
        }
        Services2.getCODPayment(params).$promise.then(function(data) {
            _.each(data.data.rows, processPayment);
            $scope.displayed = data.data.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }
    var variables = {
        'Payment': {
            model: 'queryTransactionId',
            param: 'id'
        },
        'User': {
            model: 'queryUser',
            param: 'user'
        }
    };
    // Generate :
    // searchPayment, searchUser
    lodash.each(variables, function (val, key) {
        $scope['search' + key] = function(event){
            if ((event && event.keyCode === 13) || !event) {
                $location.search(val.param, $scope[val.model]);
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                $scope.getPayment();
            }
        };
    });
    
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
        $scope.getPayment();
    }
    $scope.detailsPage = function(id) {
        window.location = '/codpayment/details/' + id;
    };
    /**
     * Get single trip
     * 
     * @return {void}
     */
    $scope.getPaymentDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.paymentID;
        Services2.getCODPaymentDetails({
            id: $scope.id,
        }).$promise.then(function(data) {
            processPayment(data.data);
            $scope.payment = data.data;
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
        if ($stateParams.paymentID !== undefined) {
            $scope.getPaymentDetails();
        }
    }
    $scope.loadDetails();
    $scope.isCollapsed = true;
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
    $scope.getDrivers = function (params) {
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
     * Open create COD Payment modals
     * @return void
     */
    $scope.openCreateCODPaymentModal = function () {
        $rootScope.$emit('startSpin');
        $scope.resetPaymentParams();
        getCompanies()
        .then(function () {
            ngDialog.open({
                template: 'createCODPaymentTemplate',
                scope: $scope,
                className: 'ngdialog-theme-default create-cod-payment-popup'
            });
        });
    };
    /**
     * Get all cod orders with no payment + Unpaid cod payments by userID
     * 
     * @return void
     */
    $scope.getCODOrdersNoPaymentAndUnpaid = function (userID) {
        $scope.selectedUserID = userID;
        $scope.isFetchingOrders = true;
        $scope.resetSelectionParams();
        $rootScope.$emit('startSpin');
        $q.all([
            Services2.getCODOrdersNoPayment({
                id: userID,
                userOrderNumbers: JSON.stringify($scope.userOrderNumbers),
            }).$promise,
            Services2.getCODPaymentsUnpaid({
                id: userID
            }).$promise
        ])
        .then(function(responses) {
            $scope.codOrdersNoPayment = responses[0].data.rows;
            $scope.codPaymentsUnpaid = responses[1].data.rows;
            if ($scope.codOrdersNoPayment.length > 0){
                $scope.formData.paymentType = 'manual';
            } else {
                $scope.formData.paymentType = 'auto';
            }
            $scope.prepareSelectedOrdersOrPayment();
            $rootScope.$emit('stopSpin');
        });
    };
    /**
     * Select all or unselect all orders.
     * 
     * @return {void}
     */
    $scope.checkUncheckSelected = function() {
        $scope.codOrdersNoPayment.forEach(function(order) {
            order.Selected = $scope.status.selectedAll;
        });
        $scope.prepareSelectedOrdersOrPayment();
    };
    /**
     * Check whether there is one or more orders selected.
     * 
     * @return {boolean}
     */
    $scope.selectedOrderExists = function() {
        var checked = false;
        $scope.codOrdersNoPayment.some(function(order) {
            if (order.Selected) {
                checked = true;
                return true;
            }
        });
        return checked;
    };
    $scope.onPaymentTypeChange = function(){
        $scope.prepareSelectedOrdersOrPayment();
    };
    $scope.prepareSelectedOrdersOrPayment = function(){
        if ($scope.formData.paymentType == 'manual'){        
            var selectedOrders = [];
            var amountPaid = 0;
            $scope.codOrdersNoPayment.forEach(function (order) {
                if (order.Selected) {
                    selectedOrders.push(order);
                    amountPaid += order.TotalValue;
                }
            });
            $scope.amountPaid = amountPaid;
            $scope.selectedOrders = selectedOrders;
        } 
        else if ($scope.formData.paymentType == 'auto'){
            if ($scope.formData.selectedPayment){
                $scope.amountPaid = $scope.formData.selectedPayment.TotalAmount;
            }
        }
    };
    /**
     * Set imported date picker
     * 
     * @return {void}
    */
    $scope.onTimeSet = function (newDate, oldDate) {
        $scope.transactionDate = newDate;
    }
    /**
     * Reset all payment params
     * 
     * @return {void}
    */
    $scope.resetPaymentParams = function () {
        $scope.clearTextArea();
        $scope.codOrdersNoPayment = [];
        $scope.codPaymentsUnpaid = [];
        $scope.selectedUserID = 0;
        $scope.resetSelectionParams();
        $scope.isFetchingOrders = false;
        $scope.isFetchingDrivers = false;
    }
    $scope.resetSelectionParams = function(){
        $scope.selectedOrder = {};
        $scope.selectedOrders = [];
        $scope.formData.selectedPayment = null;
        $scope.amountPaid = 0;
        $scope.transactionDetails = '';
    }
    /**
     * Create COD Payment
     * @return void
     */
    $scope.createCODPayment = function () {
        if ($scope.formData.paymentType == 'manual') {
            $scope.createCODPaymentManual();
        } else if ($scope.formData.paymentType == 'auto') {
            $scope.setCODPaymentManualPaid();
        }
    };
    /**
     * Create COD Payment with manual PaymentMethod
     * @return void
     */
    $scope.createCODPaymentManual = function(){
        var checked = $scope.selectedOrderExists();
        if (!checked) {
            SweetAlert.swal('Error', 'Please select at least one order before confirm payment', 'error');
            return false;
        }
        if (!$scope.transactionDetails){
            SweetAlert.swal('Error', 'Please input Transaction Details', 'error');
            return false;
        }
        var orderIDs = [];
        var userID = $scope.selectedUserID;
        $scope.selectedOrders.forEach(function(order) {
            orderIDs.push(order.UserOrderID);
        });
        var params = {
            userID: $scope.selectedUserID,
            paymentMethod: $scope.transactionType.value,
            transactionDetail: $scope.transactionDetails,
            orderIDs: orderIDs,
            paidDate: $scope.transactionDate
        };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You will create COD Payment with total amount: " + $scope.amountPaid,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, create it!",
            closeOnConfirm: false
        },
        function(isConfirm){
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                Services2.createCODPayment(params).$promise.then(function(result) {
                    SweetAlert.swal('Success', 'Your COD Payment has been created', 'success');
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
    };
    
    /**
     * Change COD Payment status from 'Unpaid' to 'Paid'
     * @return void
     */
    $scope.setCODPaymentManualPaid = function(){
        var selectedPayment = $scope.formData.selectedPayment;
        if (!selectedPayment){
            SweetAlert.swal('Error', 'Please select one transaction to confirm', 'error');
            return false;
        }
        if (!$scope.transactionDetails){
            SweetAlert.swal('Error', 'Please input Transaction Details', 'error');
            return false;
        }
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You will confirm COD Payment with total amount: " + $scope.amountPaid,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, confirm it!",
            closeOnConfirm: false
        },
        function(isConfirm){
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                var params = {
                    codPaymentID: selectedPayment.CODPaymentID,
                    paymentMethod: $scope.transactionType.value,
                    transactionDetail: $scope.transactionDetails,
                    paidDate: $scope.transactionDate
                };
                Services2.setCODPaymentManualPaid(params).$promise.then(function(result) {
                    SweetAlert.swal('Success', 'Your COD Payment has been confirmed', 'success');
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
    };
    /**
     * Cancel COD Payment
     * @return void
     */
    $scope.cancelCODPayment = function() {
        ngDialog.close();
    }
    /**
     * Refresh list with user input request
     * 
     * @return {void}
     */
    $scope.refresh = function(item) {
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getPayment(); 
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
     * Clear Multiple EDS Filter
     * 
     * @return {void}
     */
    $scope.clearTextArea = function () {
        $scope.queryMultipleEDS = '';
        if ($scope.userOrderNumbers.length > 0) {
            $scope.userOrderNumbers = [];
            $scope.getCODOrdersNoPaymentAndUnpaid($scope.selectedUserID);
        }
    };
    
});