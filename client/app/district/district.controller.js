'use strict';

angular.module('adminApp')
    .controller('DistrictCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope, 
            Services,
            Services2,
            moment, 
            lodash, 
            $state, 
            $stateParams
        ) {

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.district = {
        DistrictID: null,
        Name: '',
        City: '',
        Province: '',
        ZipCodes: '',
    };

    $scope.zipcodes = [{
        key: 0,
        value: ''
    }];

    $scope.sumZipField = 1;

    $scope.itemsByPage = 10;
    $scope.offset = 0;

    // APP FLOW PART

       /**
     * Change items by page
     * @param  {Number / String} number 
     * 
     */
    $scope.changeItemsByPage = function (number) {
        if (number !== 'All') {
            $scope.itemsByPage = number;
        } else {
            $scope.itemsByPage = null;
        }
        // this will trigger callServer()
        $scope.displayed = [];
    };

    // REQUEST PART

    var getMultipleDistricts = function (params) {
        Services2.getMultipleDistrictsMaster(params).$promise.then(function(result) {
            $scope.districts = []; 
            result.data.districts.forEach(function(district) {
                $scope.districts.push({key: district.Name, value: district.DistrictID});
            });
            $scope.displayed = result.data.districts;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                result.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    };

    /**
     * Get all districts
     * 
     * @return {void}
     */
    $scope.getDistricts = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage
        };
        getMultipleDistricts(params);
    };

    /**
     * Search districts
     * 
     * @return {void}
     */
    $scope.searchDistricts = function() {
        $rootScope.$emit('startSpin');
        if ($stateParams.query) {
            $scope.reqSearchString = $stateParams.query;
        }
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            search: $scope.reqSearchString
        };
        getMultipleDistricts(params);
    };

    /**
     * Add search params for getDistricts()
     * 
     * @return {void}
     */
    $scope.reqSearchString = '';
    $scope.search = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchString = $scope.searchQuery;
            $scope.searchDistricts();
        }
    };

    // INITIALIZATION PART

    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {
        $scope.offset = state.pagination.start;
        $scope.tableState = state;
        if ($scope.reqSearchString) {
            $scope.searchDistricts();
        } else {
            $scope.getDistricts();
        }
        $scope.isFirstLoaded = true;
    };

});
