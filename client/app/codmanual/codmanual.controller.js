'use strict';

angular.module('adminApp')
    .controller('CODManualCtrl', 
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
            $filter,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.itemsByPage = $location.search().limit || 50;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.isTableDisplayed = true;
    $scope.limitPages = [$scope.itemsByPage, 10, 25, 50, 100, 200];

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

    $scope.noPaymentSummary = [];
    $scope.companies = [];
    $scope.drivers = [];

    $scope.selectedUserID = 0;
    $scope.selectedFleetName = '';
    $scope.selectedOrder = {};
    $scope.amountPaid = 0;
    $scope.transactionDate = new Date();
    $scope.transactionDateString = moment($scope.transactionDate).format('MMM DD, HH:mm');
    $scope.transactionTypes = [
        {key: 'Bank Transfer', value: 'BankTransfer'},
        {key: 'Cash', value: 'Cash'}
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
            $scope.userOrderNumbers = newValue.split(/\s+/).filter(function (val) {
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

    var getNoPaymentSummary = function() {
        $rootScope.$emit('startSpin');

        return $q(function (resolve) {
            Services2.getNoPaymentSummary().$promise.then(function(result) {
                $scope.noPaymentSummary = result.data;
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

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
            $scope.isTableDisplayedFirstLoad = true;
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        $scope.loadCODPayment();
    }

    $scope.detailsPage = function(id) {
        $window.open('/order/details/' + id);
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
        $rootScope.$emit('startSpin');
        $scope.companies = [
            {
                User: {
                    UserID: 0
                },
                CompanyName: 'Select Fleet'
            },
            {
                User: {
                    UserID: 'all'
                },
                CompanyName: 'All Fleet'
            }
        ];

        return $q(function (resolve) {
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
     * Call getCODOrdersNoPaymentAndUnpaid function when a fleet is choosen
     * @param  {[type]} company [description]
     * @return {Object} promise of data of all drivers
     */
    $scope.chooseFleet = function (company) {
        $scope.company = company;
        $location.search('id', company.User.UserID);
        $scope.getCODOrdersNoPaymentAndUnpaid(company.User.UserID);
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
     * Get all order that exist on multiple EDS / WebOrderID searching
     *
     */
    $scope.filterByEDS = function (selectedUserID) {
        $scope.offset = 0;
        $scope.getCODOrdersNoPaymentAndUnpaid(selectedUserID, true);
    } 
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
     * Load COD Payments
     * @return void
     */
    $scope.loadCODPayment = function () {
        $rootScope.$emit('startSpin');

        getNoPaymentSummary();
        getCompanies().then($scope.getCODOrdersNoPaymentAndUnpaid);

        if ($scope.isTableDisplayedFirstLoad) {
            $scope.isTableDisplayed = false;
            $scope.isTableDisplayedFirstLoad = false;
        };
    };

    /**
     * Open confirm payment modals
     * @return void
     */
    $scope.openConfirmPaymentModal = function() {
        ngDialog.open({
            template: 'confirmPaymentTemplate',
            scope: $scope,
            className: 'ngdialog-theme-default create-cod-payment-popup'
        });
    }

    /**
     * Get all cod orders with no payment + Unpaid cod payments by userID
     * 
     * @return void
     */
    $scope.getCODOrdersNoPaymentAndUnpaid = function (userID, isEDSFilter) {
        userID = $location.search().id;
        if (userID === 0) {
            return;
        }

        var params = {};
        params.limit = $scope.itemsByPage;
        params.offset = $scope.offset;
        params.userOrderNumbers = JSON.stringify($scope.userOrderNumbers);

        $scope.isTableDisplayed = false;
        if (userID) {
            $scope.isTableDisplayed = true;
        }

        $scope.selectedUserID = userID;
        
        $scope.isFetchingOrders = true;
        $scope.resetSelectionParams();
        $rootScope.$emit('startSpin');
        if (userID !== 'all') {
            params.id = userID;
        } else {
            $scope.transactionDetails = 'Transferred by ';
        }

        $location.search('offset', $scope.offset);

        return $q(function (resolve) {
            Services2.getCODOrdersNoPayment(params).$promise
            .then(function(responses) {
                $scope.codOrdersNoPayment = responses.data.rows;
                $scope.codOrdersNoPaymentCount = responses.data.count;
                $scope.formData.paymentType = 'auto';
                if ($scope.codOrdersNoPayment.length > 0){
                    $scope.formData.paymentType = 'manual';
                }

                if (parseInt(userID)) {
                    $scope.company = lodash.find($scope.companies, {User: {'UserID': parseInt(userID)}});
                    $scope.selectedFleetName = $scope.company.CompanyName;
                    $scope.transactionDetails = 'Transferred by ' + $scope.selectedFleetName;
                    var selectedNoPaymentSummary = lodash.find($scope.noPaymentSummary, {FleetManagerID: userID.toString()});
                    $scope.selectedFleetAmount = (selectedNoPaymentSummary) ? selectedNoPaymentSummary.TotalValue : 0; 
                }

                $scope.tableState.pagination.numberOfPages = Math.ceil(
                    responses.data.count / $scope.tableState.pagination.number);
                $scope.prepareSelectedOrdersOrPayment();
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Set limit page
     * 
     * @return {void}
     */
    $scope.setLimit = function(item) {
        $location.search('limit', item);
        $scope.itemsByPage = item;
    }

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
        $scope.transactionDateString = moment(newDate).format('MMM DD, HH:mm');
    }

    /**
     * Reset all payment params
     * 
     * @return {void}
    */
    $scope.resetPaymentParams = function () {
        $scope.clearTextArea();
        $scope.codOrdersNoPayment = [];
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
        $scope.createCODPaymentManual();
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
        var selectedFleetWithOrder = [];
        var userID = $scope.selectedUserID;
        $scope.selectedOrders.forEach(function(order) {
            var fleetManagerID = order.FleetManager.UserID;
            if (!selectedFleetWithOrder[fleetManagerID]) {
                selectedFleetWithOrder[fleetManagerID] = [];
            }
            selectedFleetWithOrder[fleetManagerID].push(order.UserOrderID);
        });

        var params = {
            userID: $scope.selectedUserID,
            paymentMethod: $scope.transactionType.value,
            transactionDetail: $scope.transactionDetails,
            paidDate: $scope.transactionDate
        };
        var text = "You will create COD Payment with total amount: " +
                $scope.currency + 
                $filter('localizenumber')( $filter('number')( $scope.amountPaid ) ) +
                '<br>' +
                'Transaction Time: ' +
                $scope.transactionDateString +
                '<br>' +
                'Transaction Type: ' +
                $scope.transactionType.key;
                
        SweetAlert.swal({
            title: "Are you sure?",
            text: text,
            type: "warning",
            html: true,
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, create it!",
            closeOnConfirm: false
        },
        function(isConfirm){
            if (isConfirm) {
                $rootScope.$emit('startSpin');
                var errorResult = [];
                var successResult = [];
                selectedFleetWithOrder.forEach(function(val, key) {
                    params.userID = key;
                    params.orderIDs = val;
                    Services2.createCODPayment(params).$promise.then(function(result) {
                        var resultInvalid = '';
                        var invalidLength = 0;
                        if (result.data.invalid && result.data.invalid.length) {
                            invalidLength = result.data.invalid.length;
                            resultInvalid += '\n invalid for: ';
                            lodash.forEach(result.data.invalid, function (invalid) {
                                resultInvalid += '\n ' + invalid.orderId + ' : ' + invalid.message;
                            });
                        }
                        var resultSummary = '\n Success for closing payment : ' + val.length - invalidLength + ' Order';
                        var resultSummary = '\n Invalid for closing payment : ' + invalidLength  + ' Order';
                        successResult.push(result.data);
                        SweetAlert.swal('Success', 'Close Payment' + resultSummary + resultInvalid, 'success');
                        ngDialog.close();
                        $scope.getCODOrdersNoPaymentAndUnpaid($scope.selectedUserID, true);
                        $rootScope.$emit('stopSpin');
                    })
                    .catch(function(err) {
                        errorResult.push(err.data.error.message);
                        SweetAlert.swal('Error', err.data.error.message, 'error');
                        $rootScope.$emit('stopSpin');
                    });
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
            $scope.getCODOrdersNoPaymentAndUnpaid($scope.selectedUserID, true);
        }
    };

    //workaround for bug ui-select
    $scope.tagHandler = function (tag){
        return null;
    }
    
});
