'use strict';

angular.module('adminApp')
    .controller('HubMonitorCtrl', 
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
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.form = {};

    $scope.sumZipField = 1;

    $scope.itemsByPage = 10;
    $scope.offset = 0;

    /**
     * Get all companies
     * 
     * @return {Object} Promise
     */
    var getCompanies = function() {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getAllCompanies().$promise.then(function(result) {
                var companies = lodash.sortBy(result.data.Companies, function (i) { 
                    return i.CompanyName.toLowerCase(); 
                });
                $scope.companies = companies;
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    /**
     * Get all hubs
     * 
     * @return {void}
     */
    $scope.getHubs = function() {
        $rootScope.$emit('startSpin');
        if ($stateParams.query) {
            $scope.reqSearchString = $stateParams.query;
        }
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            search: $scope.reqSearchString,
            fetchHubOrders: true
        };
        Services2.getHubs(params).$promise.then(function(data) {
            var hubs = data.data.Hubs.rows;
            $scope.hubs = []; 
            hubs.forEach(function(hub) {
                $scope.hubs.push({key: hub.Name, value: hub.HubID});
            });
            $scope.displayed = hubs;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.Hubs.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    };

    /**
     * Add search params for getHubs()
     * 
     * @return {void}
     */
    $scope.reqSearchString = '';
    $scope.search = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchString = $scope.searchQuery;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            $scope.getHubs();
        }
    };

    
    
    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {
        $scope.offset = state.pagination.start;
        $scope.tableState = state;
        $scope.getHubs();
        $scope.isFirstLoaded = true;
    };

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        getCompanies();
        if ($stateParams.hubID !== undefined) {
            $scope.getHubDetails();
            $scope.updatePage = true;
            $scope.addPage = false;
        } else {
            $scope.addPage = true;
        }
    };

    $scope.loadManagePage();

  });
