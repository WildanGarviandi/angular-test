'use strict';

angular.module('adminApp')
    .controller('CityCtrl', 
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
            $window
        ) {

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.city = {
        Name: '',
        EcommercePriceReferenced: false,
        StateID: 0 
    };

    $scope.cityStatus = {
        key: 'Active',
        value: '1'
    };

    $scope.cityStatuses = [$scope.cityStatus,  {
        key: 'Inactive',
        value: '0'
    }, {
        key: 'All',
        value: 'all'
    }];

    $scope.itemsByPage = 10;
    $scope.offset = 0;

    var createCity = function(callback) {
        var city = {
            Name: $scope.city.Name,
            EcommercePriceReferenced: $scope.city.EcommercePriceReferenced,
            StateID: $scope.city.StateID
        };
        $rootScope.$emit('startSpin');
        Services2.createCity(city).$promise.then(function(response, error) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response);
            } else {
                return callback(error);
            }
        })
        .catch(function() {
            $rootScope.$emit('stopSpin');
            return callback(error);
        });
    }

    var updateCity = function(callback) {
        if ($scope.city.EcommercePriceReferenced === undefined) {
            $scope.city.EcommercePriceReferenced = false;
        }
        var city = {
            Name: $scope.city.Name,
            EcommercePriceReferenced: $scope.city.EcommercePriceReferenced,
            StateID: $scope.city.StateID
        };
        $rootScope.$emit('startSpin');
        Services2.updateCity({
            id: $stateParams.cityID
        }, city).$promise.then(function(response, error) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response);
            } else {
                return callback(error);
            }
        })
        .catch(function(error) {
            $rootScope.$emit('stopSpin');
            return callback(error);
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
     * Choose status E-Commerce Price
     * 
     * @return {void}
     */
    $scope.chooseStatus = function(item) {
            $scope.cityStatus = item;
            $scope.offset = 0;
            if (!$stateParams.query) {
                $scope.getCities();
            }
        };

    /**
     * Create single city
     * 
     * @return {void}
     */
    $scope.createCity = function() {
        createCity(function(err, city) {   
            if (err) {
                alert('Error: '+ err.data.error.message );
            } else {
                alert('Your city ID:' + city.data.City.CityID + ' has been successfully created.');
                $location.path('/cities');
            } 
        });
    }    

    /**
     * Update single city
     * 
     * @return {void}
     */
    $scope.updateCity = function() {
        updateCity(function(err, city) {
            if (err) {
                alert('Error: '+ err.data.error.message );
            } else {
                alert('Your city ID:' + city.data.City.CityID + ' has been successfully updated.');
                $location.path('/cities');
            } 
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
        Services2.getOneCity({
            id: $scope.id,
        }).$promise.then(function(data) {
            $scope.city = data.data.City;
            $scope.state = {key: $scope.city.StateMaster.Name, value: $scope.city.StateMaster.StateID};
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
            search: $scope.reqSearchString,
            status: $scope.cityStatus.value
        };
        Services2.getCities(params).$promise.then(function(data) {
            $scope.displayed = data.data.Cities.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.Cities.count / $scope.tableState.pagination.number);
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
        $rootScope.$emit('startSpin');
        Services2.deleteCity({
            id: id,
        }, {}).$promise.then(function(result) {
            if (result.data.Status === 1) {
                alert('Delete success');
            } else {
                alert('Failed');                
            }  
            $scope.getCities();
            $rootScope.$emit('stopSpin');
        }).catch(function() {
            alert('Delete failed');
            $scope.getCities();
            $rootScope.$emit('stopSpin');
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
            EcommercePriceReferenced: true
        }
        if ($window.confirm('Are you sure you want check this city?')) {
        $rootScope.$emit('startSpin');
        Services2.updateCity({
            id: id
        }, city).$promise.then(function(result) {  
            alert('Check success');
            $scope.getCities();
            $rootScope.$emit('stopSpin');
        }).catch(function() {
            alert('Check failed');
            $scope.getCities();
            $rootScope.$emit('stopSpin');
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
            EcommercePriceReferenced: false
        }
        if ($window.confirm('Are you sure you want uncheck this city?')) {
        $rootScope.$emit('startSpin');
        Services2.updateCity({
            id: id
        }, city).$promise.then(function(result) {  
            alert('Uncheck success');
            $scope.getCities();
            $rootScope.$emit('stopSpin');
        }).catch(function() {
            alert('Uncheck failed');
            $scope.getCities();
            $rootScope.$emit('stopSpin');
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
        $scope.getStates();
        if ($stateParams.cityID !== undefined) {
            $scope.getCityDetails();
            $scope.updatePage = true;
            $scope.addPage = false;
        } else {
            $scope.addPage = true;
        }
    }

    /**
     * Assign state to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseState = function(item) {
        $scope.city.StateID = item.value;
        $scope.state = item;
    }

    /**
     * Get all states
     * 
     * @return {void}
     */
    $scope.getStates = function() {
        Services2.getStates().$promise
        .then(function(data) {
            $scope.states = []; 
            data.data.States.rows.forEach(function(state) {
                $scope.states.push({key: state.Name, value: state.StateID});
            }); 
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.loadManagePage();

  });
