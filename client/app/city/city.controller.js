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
            SweetAlert,
            $state, 
            $stateParams,
            $location, 
            $http, 
            $window
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.city = {
        Name: '',
        EcommercePriceReferenced: false,
        StateID: 0,
        PortID: 0
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

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;

    var createCity = function(callback) {
        var city = {
            Name: $scope.city.Name,
            EcommercePriceReferenced: $scope.city.EcommercePriceReferenced,
            StateID: $scope.city.StateID,
            PortID: $scope.city.PortID
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
            StateID: $scope.city.StateID,
            PortID: $scope.city.PortID
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

    //workaround for bug ui-select
    $scope.tagHandler = function (tag){
        return null;
    }

    /**
     * Choose status E-Commerce Price
     * 
     * @return {void}
     */
    $scope.chooseStatus = function(item) {
        $location.search('status', item.value);
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
        if (!$scope.city.Name || !$scope.city.StateID) {
            return SweetAlert.swal('Error', 'Name and State is required', 'error');
        }

        createCity(function(err, city) {   
            if (err) {
                SweetAlert.swal('Error', err.data.error.message, 'error');
            } else {
                SweetAlert.swal({
                    title: 'Success',
                    text: city.data.City.Name + " (city ID:" + city.data.City.CityID + ") has been successfully created.",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                }, function (isConfirm){ 
                    if (isConfirm) {
                        $location.path('/cities');
                    }
                });
            } 
        });
    }    

    /**
     * Update single city
     * 
     * @return {void}
     */
    $scope.updateCity = function() {
        if (!$scope.city.Name) {
            return SweetAlert.swal('Error', 'Name and State is required', 'error');
        }

        updateCity(function(err, city) {
            if (err) {
                SweetAlert.swal('Error', err.data.error.message, 'error');
            } else {
                SweetAlert.swal({
                    title: 'Success',
                    text: city.data.City.Name + " (city ID:" + city.data.City.CityID + ") has been successfully updated.",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                }, function (isConfirm){ 
                    if (isConfirm) {
                        $location.path('/cities');
                    }
                });
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
            if ($scope.city.Port) {
                $scope.port = {key: $scope.city.Port.ThreeLetterCode, value: $scope.city.Port.PortID};
            }
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
        $scope.reqSearchString = $scope.searchQuery = $location.search().q || $scope.searchQuery;

        var value = $location.search().status || $scope.cityStatus.value;
        $scope.cityStatus = lodash.find($scope.cityStatuses, { 'value': value });

        $location.search('offset', $scope.offset);
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            search: $scope.reqSearchString,
            status: $scope.cityStatus.value
        };
        Services2.getCities(params).$promise.then(function(data) {
            $scope.displayed = data.data.Cities.rows;
            $scope.count = data.data.Cities.count;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                $scope.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get all ports (TLC)
     * 
     * @return {void}
     */
    $scope.getPorts = function() {
        return Services2.getPorts().$promise.then(function(data) {
            $scope.ports = []; 
            data.data.forEach(function(port) {
                $scope.ports.push({key: port.ThreeLetterCode, value: port.PortID});
            });
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
            $location.search('q', $scope.searchQuery);
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
                SweetAlert.swal('Success', 'Delete Success', 'success');
            } else {
                SweetAlert.swal('Error', 'Failed', 'error');
            }  
            $scope.getCities();
            $rootScope.$emit('stopSpin');
        }).catch(function() {
            SweetAlert.swal('Error', 'Delete failed', 'error');
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
    $scope.toggleTrue = function(id, paramVariable) {
        var city = {};
        city[paramVariable] = true;

        if ($window.confirm('Are you sure you want check this city?')) {
            $rootScope.$emit('startSpin');
            Services2.updateCity({
                id: id
            }, city).$promise.then(function(result) {
                SweetAlert.swal('Success', 'Check success', 'success');
                $scope.getCities();
                $rootScope.$emit('stopSpin');
            }).catch(function() {
                SweetAlert.swal('Error', 'Check failed', 'error');
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
    $scope.toggleFalse = function(id, paramVariable) {
        var city = {};
        city[paramVariable] = false;

        if ($window.confirm('Are you sure you want uncheck this city?')) {
            $rootScope.$emit('startSpin');
            Services2.updateCity({
                id: id
            }, city).$promise.then(function(result) {  
                SweetAlert.swal('Success', 'Uncheck success', 'success');
                $scope.getCities();
                $rootScope.$emit('stopSpin');
            }).catch(function() {
                SweetAlert.swal('Error', 'Uncheck failed', 'error');
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
        $scope.tableState = state;
        if ($scope.isFirstLoaded) {
            $scope.tableState.pagination.start = $scope.offset;
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        $scope.getCities();
    }

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        $scope.getStates();
        $scope.getPorts();
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
     * Assign port to the chosen item
     * 
     * @return {void}
     */
    $scope.choosePort = function(item) {
        $scope.city.PortID = item.value;
        $scope.port = item;
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

    /**
     * to create uppercase and maximum 3 string character
     * 
     * @return {void}
     */
    $scope.threeLetterCodeValidator = function (event) {
        if (event && $scope.city.ThreeLetterCode) {
            $scope.city.ThreeLetterCode = $scope.city.ThreeLetterCode.replace(/[^a-zA-Z]/g, '')
            $scope.city.ThreeLetterCode = $scope.city.ThreeLetterCode.toUpperCase();
            $scope.city.ThreeLetterCode = $scope.city.ThreeLetterCode.substr(0, 3);
        }
    }

    $scope.loadManagePage();

  });
