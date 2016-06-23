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
            $timeout
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

    $scope.queryTransactionId = '';
    $scope.queryUser = '';

    function processPayment(payment){
        if (payment.User.UserType.UserTypeID == 3){
            // driver
            payment.User.FullName = payment.User.FirstName+' '+payment.User.LastName;
        } else if (payment.User.UserType.UserTypeID == 4){
            // fleet manager
            payment.User.FullName = payment.User.CompanyDetail.CompanyName;
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
            _.each(data.data.rows, processPayment);
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

  });
