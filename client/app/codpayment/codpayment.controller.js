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

    $scope.itemsByPage = 10;
    $scope.offset = 0;

    $scope.statuses = [
        {key: 'All', value: ''},
        {key: 'Paid', value: 'Paid'},
        {key: 'Unpaid', value: 'Unpaid'}
    ];
    $scope.status = $scope.statuses[0];

    $scope.userTypes = [
        {key: 'All', value: ''},
        {key: 'Driver', value: '3'},
        {key: 'Fleet Manager', value: '4'}
    ];
    $scope.userType = $scope.userTypes[0];

    $scope.paymentMethods = [
        {key: 'All', value: ''},
        {key: 'DokuOneCheckout', value: 'DokuOneCheckout'},
        {key: 'Cash', value: 'Cash'},
        {key: 'BankTransfer', value: 'BankTransfer'}
    ];
    $scope.paymentMethod = $scope.paymentMethods[0];

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

    $scope.chooseStatus = function(item) {
        $scope.status = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getPayment(); 
    }

    $scope.choosePaymentMethod = function(item) {
        $scope.paymentMethod = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getPayment(); 
    }

    $scope.chooseUserType = function(item) {
        $scope.userType = item;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getPayment(); 
    }

    $scope.chooseTransactionType = function(item) {
        $scope.transactionType = item;
    }

    $scope.queryTransactionId = '';
    $scope.queryUser = '';

    /**
     * Get all trips
     * 
     * @return {void}
     */
    $scope.getPayment = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            transactionId: $scope.queryTransactionId,
            user: $scope.queryUser,
            status: $scope.status.value,
            paymentMethod: $scope.paymentMethod.value,
            userType: $scope.userType.value
        }
        Services2.getCODPayment(params).$promise.then(function(data) {
            $scope.displayed = data.data.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.searchPayment = function(event){
        if ((event && event.keyCode === 13) || !event) {
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getPayment();
        };
    };
    
    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {        
        $scope.offset = state.pagination.start;
        $scope.tableState = state;
        $scope.getPayment();
        $scope.isFirstLoaded = true;
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
     * Get all cod orders by userID
     * 
     * @return void
     */
    $scope.getCODOrders = function (userID) {
        $scope.selectedUserID = userID;
        $scope.isFetchingOrders = true;
        $rootScope.$emit('startSpin');
        Services2.getCODOrdersNoPayment({
            id: userID
        }).$promise.then(function(result) {
            $scope.codOrdersNoPayment = result.data.rows;
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
        $scope.prepareSelectedOrders();
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

    /**
     * Prepare selected orders.
     * 
     * @return {array}
     */
    $scope.prepareSelectedOrders = function() {            
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
        $scope.codOrdersNoPayment = [];
        $scope.selectedUserID = 0;
        $scope.selectedOrder = {};
        $scope.amountPaid = 0;
        $scope.transactionDetails = '';
        $scope.isFetchingOrders = false;
        $scope.isFetchingDrivers = false;
    }

    /**
     * Create COD Payment
     * @return void
     */
    $scope.createCODPayment = function () {
        var checked = $scope.selectedOrderExists();
        if (!checked) {
            SweetAlert.swal('Error', 'Please select at least one order before confirm payment', 'error');
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
     * Cancel COD Payment
     * @return void
     */
    $scope.cancelCODPayment = function() {
        ngDialog.close();
    }


});
