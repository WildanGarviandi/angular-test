'use strict';

angular.module('adminApp')
    .controller('CityCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope, 
            Services, 
            moment, 
            lodash, 
            $state, 
            $stateParams,
            $location, 
            $http, 
            $window
        ) {

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.city = {
        Name: '',
        EcommercePriceReferenced: false
    };

    $scope.itemsByPage = 10;
    $scope.offset = 0;

    var createCity = function(callback) {
        var city = {
            Name: $scope.city.Name,
            EcommercePriceReferenced: $scope.city.EcommercePriceReferenced
        };
        console.log('create city', city);
        $rootScope.$emit('startSpin');
        Services.createCity(city).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response);
            } else {
                return callback('failed');
            }
        })
        .catch(function() {
            $rootScope.$emit('stopSpin');
            return callback('failed');
        });
    }

    var updateCity = function(callback) {
        if ($scope.city.EcommercePriceReferenced === undefined) {
            $scope.city.EcommercePriceReferenced = false;
        }
        var city = {
            id: $stateParams.cityID,
            Name: $scope.city.Name,
            EcommercePriceReferenced: $scope.city.EcommercePriceReferenced
        };
        console.log('update city', city);
        $rootScope.$emit('startSpin');
        Services.updateCity(city).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response);
            } else {
                return callback('failed');
            }
        })
        .catch(function() {
            $rootScope.$emit('stopSpin');
            return callback('failed');
        });
    }

    /**
     * Redirect to add city page
     * 
     * @return {void}
     */
    $scope.addCity = function() {
        window.location = '/add-city';
    }

    /**
     * Redirect to edit city page
     * 
     * @return {void}
     */
    $scope.editCity = function(id) {
        window.location = '/update-city/' + id;
    }

    /**
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function() {
        $window.history.back();
    }

    /**
     * Create single city
     * 
     * @return {void}
     */
    $scope.createCity = function() {
        createCity(function(err, city) {        
            if (city.status === false) {
                alert('error');
            };
            alert('Your city ID:' + city.data.CityID + ' has been successfully created.')
            $location.path('/cities');
        });
    }    

    /**
     * Update single city
     * 
     * @return {void}
     */
    $scope.updateCity = function() {
        updateCity(function(err, city) {
            console.log(city)
            if (city.status === false) {
                alert('error')
            }
            alert('Your city ID:' + city.data.CityID + ' has been successfully updated.')
            $location.path('/cities');
        });
    }   

    /**
     * Get single city
     * 
     * @return {void}
     */
    $scope.getCityDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.cityID;
        Services.getAllCities({
            id: $scope.id,
        }).$promise.then(function(data) {
            $scope.city = data.city;
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get all cities
     * 
     * @return {void}
     */
    $scope.getCities = function() {
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
        Services.getAllCities(params).$promise.then(function(data) {
            $scope.displayed = data.city.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Add search params
     * 
     * @return {void}
     */
    $scope.reqSearchString = '';
    $scope.search = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchString = $scope.searchQuery;
            $scope.getCities();
        };
    } 

    /**
     * Delete single city
     * 
     * @return {void}
     */
    $scope.deleteCity = function(id) {
        if ($window.confirm('Are you sure you want to delete this city?')) {
        Services.deleteCity({
            id: id,
        }).$promise.then(function(result) {  
            alert('Delete success');
            $scope.getCities();
        }).catch(function() {
            alert('Delete failed');
            $scope.getCities();
        });
      }
    }

    /**
     * Toggle true
     * 
     * @return {void}
     */
    $scope.toggleTrue = function(id) {
        var city = {
            id: id,
            EcommercePriceReferenced: true
        }
        if ($window.confirm('Are you sure you want check this city?')) {
        Services.updateCity(city).$promise.then(function(result) {  
            alert('Check success');
            $scope.getCities();
        }).catch(function() {
            alert('Check failed');
            $scope.getCities();
        });
      }
    }

    /**
     * Toggle false
     * 
     * @return {void}
     */
    $scope.toggleFalse = function(id) {
        var city = {
            id: id,
            EcommercePriceReferenced: false
        }
        if ($window.confirm('Are you sure you want uncheck this city?')) {
        Services.updateCity(city).$promise.then(function(result) {  
            alert('Uncheck success');
            $scope.getCities();
        }).catch(function() {
            alert('Uncheck failed');
            $scope.getCities();
        });
      }
    }

    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {
        $scope.offset = state.pagination.start;
        $scope.tableState = state;
        $scope.getCities();
        $scope.isFirstLoaded = true;
    }

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        if ($stateParams.cityID !== undefined) {
            $scope.getCityDetails();
            $scope.updatePage = true;
            $scope.addPage = false;
        } else {
            $scope.addPage = true;
        }
    }

    $scope.loadManagePage();

  });
