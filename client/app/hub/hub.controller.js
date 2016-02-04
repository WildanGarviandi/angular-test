'use strict';

angular.module('adminApp')
    .controller('HubCtrl', 
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
        ){

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.hub = {
        ParentHubID: null,
        Name: '',
        Type: '',
        Address1: '',
        Address2: '',
        Latitude: -6.2115,
        Longitude: 106.8452,
        City: '',
        State: '',
        Country: '',
        ZipCode: ''
    }

    $scope.itemsByPage = 10;
    $scope.offset = 0;

    var createHub = function(callback) {
        var hub = {
            ParentHubID: $scope.hub.ParentHubID,
            Name: $scope.hub.Name,
            Type: $scope.hub.Type,
            Latitude: $scope.hub.Latitude,
            Longitude: $scope.hub.Longitude,
            Address1: $scope.hub.Address1,
            Address2: $scope.hub.Address2,
            City: $scope.hub.City,
            State: $scope.hub.State,
            Country: $scope.hub.Country,
            ZipCode: $scope.hub.ZipCode,
            CountryCode: null,
            CityID: null,
            StateID: null,
            CountryID: null
        }
        console.log('create hub', hub);
        $rootScope.$emit('startSpin');
        Services.createHub(hub).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            console.log('create hub response', response);
            if (response) {
                return callback(null, response)
            } else {
                return callback('failed')
            }
        })
        .catch(function() {
            $rootScope.$emit('stopSpin');
            return callback('failed')
        });
    }

    var updateHub = function(callback) {
        var hub = {
            HubID: $stateParams.hubID,
            ParentHubID: $scope.hub.ParentHubID,
            Name: $scope.hub.Name,
            Type: $scope.hub.Type,
            Latitude: $scope.hub.Latitude,
            Longitude: $scope.hub.Longitude,
            Address1: $scope.hub.Address1,
            Address2: $scope.hub.Address2,
            City: $scope.hub.City,
            State: $scope.hub.State,
            Country: $scope.hub.Country,
            ZipCode: $scope.hub.ZipCode,
            CountryCode: null,
            CityID: null,
            StateID: null,
            CountryID: null
        }
        console.log('update hub', hub);
        $rootScope.$emit('startSpin');
        Services.updateHub(hub).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            console.log('update hub response', response);
            if (response) {
                return callback(null, response)
            } else {
                return callback('failed')
            }
        })
        .catch(function() {
            $rootScope.$emit('stopSpin');
            return callback('failed')
        });
    }

    /**
     * Assign parent to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseParent = function(item) {
        $scope.hub.ParentHubID = item.value;
        $scope.parent = item;
    }

    /**
     * Redirect to add hub page
     * 
     * @return {void}
     */
    $scope.addHub = function() {
        window.location = '/add-hub';
    }

    /**
     * Redirect to edit hub page
     * 
     * @return {void}
     */
    $scope.editHub = function(id) {
        window.location = '/update-hub/' + id;
    }

    /**
     * Update address components
     * 
     * @return {void}
     */
    $scope.updateLocation = function(addressComponents) {
        $scope.hub.Address1 = addressComponents.addressLine1;
        $scope.hub.State = addressComponents.stateOrProvince;
        $scope.hub.ZipCode = addressComponents.postalCode;
    }

    /**
     * Pick location from maps
     * 
     * @return {void}
     */
    $scope.locationPicker = function() {
        $('#maps').locationpicker({
            location: {latitude: $scope.hub.Latitude, longitude: $scope.hub.Longitude},   
            radius: 300,
            inputBinding: {
                latitudeInput: $('#us2-lat'),
                longitudeInput: $('#us2-lon'),
                locationNameInput: $('#us2-address') 
            },
            enableAutocomplete: true,
            onchanged: function (currentLocation, radius, isMarkerDropped) {
                var addressComponents = $(this).locationpicker('map').location.addressComponents;
                $scope.updateLocation(addressComponents);
            },
        });
    }

    /**
     * Get single hub
     * 
     * @return {void}
     */
    $scope.getHubDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.hubID;
        Services.getOne({
            _id: $scope.id,
        }).$promise.then(function(data) {
            $scope.hub = data.hub;
            if (data.parent) {
                $scope.parent = {key: data.parent.Name, value: data.parent.HubID};
            }
                $scope.locationPicker();
                $scope.isLoading = false;
                $rootScope.$emit('stopSpin');
        });
    }

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
            count: $scope.itemsByPage,
            search: $scope.reqSearchString
        }
        Services.get(params).$promise.then(function(data) {
            $scope.hubs = []; 
            data.hubs.forEach(function(hub) {
                $scope.hubs.push({key: hub.Name, value: hub.HubID});
            }) 
            $scope.displayed = data.hubs;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get parent selection
     * 
     * @return {void}
     */
    $scope.getParents = function() {
        Services.getAll().$promise.then(function(data) {
            $scope.hubs = []; 
            data.hubs.forEach(function(hub) {
                $scope.hubs.push({key: hub.Name, value: hub.HubID});
            }) 
        });
    }

    /**
     * Add search params for getHubs()
     * 
     * @return {void}
     */
    $scope.reqSearchString = '';
    $scope.search = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchString = $scope.searchQuery;
            $scope.getHubs();
        };
    }

    /**
     * Create single hub
     * 
     * @return {void}
     */
    $scope.createHub = function() {
        createHub(function(err, hub) {        
            if (hub.status === false) {
                alert('error')
            };
            alert('Your hub ID:' + hub.data.HubID + ' has been successfully created.')
            $location.path('/dashboard');
        })
    }

    /**
     * Update single hub
     * 
     * @return {void}
     */
    $scope.updateHub = function() {
        console.log('update')
        updateHub(function(err, hub) {
            console.log(hub)
            if (hub.status === false) {
                alert('error')
            }
            alert('Your hub ID:' + hub.data.HubID + ' has been successfully updated.')
            $location.path('/dashboard');
        })
    }    

    /**
     * Delete single hub
     * 
     * @return {void}
     */
    $scope.deleteHub = function(id) {
        if ($window.confirm('Are you sure you want to delete this hub?')) {
        Services.deleteHub({
            _id: id,
        }).$promise.then(function(result) {  
            alert('Success')
            $scope.getHubs();
        }).catch(function() {
            alert('Failed')
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
        $scope.getHubs();
        $scope.isFirstLoaded = true;
    }

    /**
     * Get all countries
     * 
     * @return {void}
     */
    $scope.getCountries = function(val) {
        return Services.getCountries({
            address: val
        }).$promise.then(function(response){
            return response.countries.map(function(item){
                return item.Name;
            });
        });
    };

    /**
     * Get all cities
     * 
     * @return {void}
     */
    $scope.getCities = function(val) {
        return Services.getCities({
            address: val
        }).$promise.then(function(response){
            return response.cities.map(function(item){
                return item.Name;
            });
        });
    };

    /**
     * Get all states
     * 
     * @return {void}
     */
    $scope.getStates = function(val) {
        return Services.getStates({
            address: val
        }).$promise.then(function(response){
            return response.states.map(function(item){
                return item.Name;
            });
        });
    };

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        $scope.getCountries();
        $scope.getStates();
        $scope.getCities();
        $scope.getParents();
        if ($stateParams.hubID !== undefined) {
            $scope.getHubDetails();
            $scope.updatePage = true;
            $scope.addPage = false;
        } else {
            $scope.addPage = true;
            $scope.locationPicker();
        }
    }

    $scope.loadManagePage();

  });
