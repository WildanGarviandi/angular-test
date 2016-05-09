'use strict';

angular.module('adminApp')
    .controller('HubCtrl', 
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
    };

    $scope.types = [{
        key: 'CENTRAL',
        value: 'CENTRAL'
    }, {
        key: 'GENERAL',
        value: 'GENERAL'
    },  ];

    $scope.zipcodes = [{
        key: 0,
        value: ''
    }];

    $scope.sumZipField = 1;

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
        };
        $rootScope.$emit('startSpin');
        Services2.createHub(hub).$promise.then(function(response, error) {
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

    var updateHub = function(callback) {
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
        $rootScope.$emit('startSpin');
        Services2.updateHub({
            id: $stateParams.hubID,
        }, hub).$promise.then(function(response, error) {
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
     * Assign parent to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseParent = function(item) {
        $scope.hub.ParentHubID = item.value;
        $scope.parent = item;
    }

    /**
     * Assign type to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseType = function(item) {
        $scope.hub.Type = item.value;
        $scope.type = item;
    }

    /**
     * Add zipcode field
     * 
     * @return {void}
     */
    $scope.addField = function() {
        $scope.zipcodes.push({ key: $scope.sumZipField, value: '' });
        $scope.sumZipField++;
    }

    /**
     * Remove zipcode field
     * 
     * @return {void}
     */
    $scope.deleteField = function(idx) {
        $scope.zipcodes.splice(idx, 1);
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
     * Redirect to manage zipcodes page
     * 
     * @return {void}
     */
    $scope.manageZipcodes = function(id) {
        window.location = '/manage-zipcodes/' + id;
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
            radius: null,
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
        Services2.getOneHub({
            id: $scope.id,
        }).$promise.then(function(data) {
            $scope.hub = data.data.Hub;
            $scope.type = {key: $scope.hub.Type, value: $scope.hub.Type};
            if ($scope.hub.ParentHub) {
                $scope.parent = {key: $scope.hub.ParentHub.Name, value: $scope.hub.ParentHub.HubID};
            }
            if ($scope.hub.HubZipCodes.length > 0) {
                $scope.zipcodes = []
                $scope.hub.HubZipCodes.forEach(function(zip, idx) {
                    $scope.zipcodes.push({key: idx, value: zip.ZipCode});
                }) 
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
            limit: $scope.itemsByPage,
            search: $scope.reqSearchString
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
    }

    /**
     * Get parent selection
     * 
     * @return {void}
     */
    $scope.getParents = function() {
        Services2.getHubs().$promise.then(function(data) {
            $scope.hubs = []; 
            data.data.Hubs.rows.forEach(function(hub) {
                $scope.hubs.push({key: hub.Name, value: hub.HubID});
            });
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
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
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
            if (err) {
                alert('Error: '+ err.data.error.message );
            } else {
                alert('Your hub ID:' + hub.data.Hub.HubID + ' has been successfully created.');
                $location.path('/dashboard');
            } 
        })
    }

    /**
     * Update single hub
     * 
     * @return {void}
     */
    $scope.updateHub = function() {
        updateHub(function(err, hub) {
            if (err) {
                alert('Error: '+ err.data.error.message );
            } else {
                alert('Your hub ID:' + hub.data.Hub.HubID + ' has been successfully updated.');
                $location.path('/dashboard');
            } 
        })
    }    

    /**
     * Delete single hub
     * 
     * @return {void}
     */
    $scope.deleteHub = function(id) {
        if ($window.confirm('Are you sure you want to delete this hub?')) {
        Services2.deleteHub({
            id: id,
        }, {}).$promise.then(function(result) {  
            if (result.data.Status === 1) {
                alert('Success');
            } else {
                alert('Failed');                
            }
            $scope.getHubs();
        }).catch(function() {
            alert('Failed');
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
     * Save zip codes
     * 
     * @return {void}
     */
    $scope.addZipCode = function() {
        $rootScope.$emit('startSpin');
        var params = []
        $scope.zipcodes.forEach(function(zip) {
            var HubZipcodes = {};
            HubZipcodes['HubID'] = $stateParams.hubID;
            HubZipcodes['ZipCode'] = zip.value;
            params.push(HubZipcodes);
        }) 
        Services2.saveZipcodes({
            id: $stateParams.hubID,
        }, {
            params:params
        }).$promise.then(function(data) {
            if (data.data.Hubs) {
                alert('Success');
                window.location = '/update-hub/' + $stateParams.hubID;
            } else {
                alert('Failed');                 
            }
            $rootScope.$emit('stopSpin');
        });
    }

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
