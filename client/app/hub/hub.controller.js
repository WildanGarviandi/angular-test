'use strict';

angular.module('adminApp')
    .controller('HubCtrl', 
        function(
            $scope,
            config, 
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
            SweetAlert,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
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
        key: 'LOCAL',
        value: 'GENERAL'
    },  ];

    $scope.zipcodes = [{
        key: 0,
        value: ''
    }];
    $scope.deleteZipcodes = [];
    $scope.form = {};

    $scope.sumZipField = 1;

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;

    var createHub = function(callback) {
        $scope.submitted = true;

        if (!($scope.hub.Country && $scope.hub.State && $scope.hub.City && $scope.hub.Type && $scope.fleetManager && $scope.fleetManager.User)) {
            return;
        }
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
            FleetManagerID: $scope.fleetManager.User.UserID,
            CountryCode: $scope.hub.CountryCode,
            CityID: $scope.hub.CityID,
            StateID: $scope.hub.StateID,
            CountryID: $scope.hub.CountryID,
        };
        $rootScope.$emit('startSpin');
        Services2.createHub(hub).$promise.then(function(response, error) {
            $rootScope.$emit('stopSpin');
            if (response) {
                callback(null, response);
                return $window.location = '/hub';
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
        $scope.submitted = true;

        if (!($scope.hub.Country && $scope.hub.State && $scope.hub.City && $scope.hub.Type && $scope.fleetManager && $scope.fleetManager.User)) {
            return;
        }

        var hub = {
            ParentHubID: $scope.hub.ParentHubID,
            Name: $scope.hub.Name,
            Type: $scope.hub.Type,
            Latitude: $scope.hub.Latitude,
            Longitude: $scope.hub.Longitude,
            Address1: $scope.hub.Address1,
            Address2: $scope.hub.Address2,
            FleetManagerID: $scope.fleetManager.User.UserID,
            CountryID: $scope.hub.CountryID,
            CountryCode: $scope.hub.CountryCode,
            Country: $scope.hub.Country,
            StateID: $scope.hub.StateID,
            State: $scope.hub.State,
            CityID: $scope.hub.CityID,
            City: $scope.hub.City,
            ZipCode: $scope.hub.ZipCode,
        }
        $rootScope.$emit('startSpin');
        Services2.updateHub({
            id: $stateParams.hubID,
        }, hub).$promise.then(function(response, error) {
            $rootScope.$emit('stopSpin');
            if (response) {
                callback(null, response);
                return $window.location = '/hub';
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
        if ($scope.hub.Type === 'CENTRAL') {
            $scope.hub.ParentHubID = null;
            $scope.parent = null;
        }
    }

    $scope.chooseFleetManager = function(item) {
        $scope.hub.FleetManagerID = item.FleetManagerID;
        $scope.fleetManager = item;
    };

    $scope.chooseCountry = function(item){
        var prevCountryID = $scope.hub.CountryID;
        $scope.form.country = item;
        $scope.hub.CountryID = item.CountryID;
        $scope.hub.Country = item.Name;
        $scope.hub.CountryCode = item.CountryCode;
        if (!prevCountryID || prevCountryID != item.CountryID){
            // reset state and city
            $scope.hub.StateID = null;
            $scope.hub.State = null;
            $scope.form.state = null;
            $scope.hub.CityID = null;
            $scope.hub.City = null;
            $scope.form.city = null;
            $scope.getStates();
        }
    };

    $scope.chooseState = function(item){
        var prevStateID = $scope.hub.StateID;
        $scope.form.state = item;
        $scope.hub.StateID = item.StateID;
        $scope.hub.State = item.Name;
        if (!prevStateID || prevStateID != item.StateID){
            // reset city
            $scope.hub.CityID = null;
            $scope.hub.City = null;
            $scope.form.city = null;
            $scope.getCities();
        }
    };

    $scope.chooseCity = function(item){
        $scope.form.city = item;
        $scope.hub.CityID = item.CityID;
        $scope.hub.City = item.Name;
    };

    /**
     * Add zipcode field
     * 
     * @return {void}
     */
    $scope.addField = function() {
        $scope.zipcodes.push({ key: $scope.sumZipField, value: '', isNewRow: true });
        $scope.sumZipField++;
    }

    /**
     * Remove zipcode field
     * 
     * @return {void}
     */
    $scope.deleteField = function(idx) {
        $scope.deleteZipcodes.push($scope.zipcodes[idx].value);
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
        return Services2.getOneHub({
            id: $scope.id,
        }).$promise.then(function(data) {
            $scope.hub = data.data.Hub;
            $scope.type = {key: $scope.hub.Type, value: $scope.hub.Type};
            if ($scope.hub.Type === 'GENERAL') {
                $scope.type = {key: 'LOCAL', value: $scope.hub.Type};
            }
            if ($scope.hub.ParentHub) {
                $scope.parent = {key: $scope.hub.ParentHub.Name, value: $scope.hub.ParentHub.HubID};
            }
            if ($scope.hub.HubZipCodes.length > 0) {
                $scope.zipcodes = []
                $scope.hub.HubZipCodes.forEach(function(zip, idx) {
                    $scope.zipcodes.push({key: idx, value: zip.ZipCode});
                })
            }
            $scope.fleetManager = lodash.find($scope.companies, {
                CompanyDetailID: $scope.hub.User.CompanyDetail.CompanyDetailID});
            $scope.locationPicker();
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');

            // in case StateID and CityID is set, load the options
            $scope.getStates();
            $scope.getCities();
        });
    }

    /**
     * Get all hubs
     * 
     * @return {void}
     */
    $scope.getHubs = function() {
        $rootScope.$emit('startSpin');
        $scope.reqSearchString = $scope.searchQuery = $location.search().q || $scope.searchQuery;
        $location.search('offset', $scope.offset);
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            search: $scope.reqSearchString
        };
        Services2.getHubs(params).$promise.then(function(data) {
            var hubs = data.data.Hubs.rows;
            $scope.hubs = []; 
            hubs.forEach(function(hub, idx) {
                $scope.hubs.push({key: hub.Name, value: hub.HubID});
                if (hub.Type === 'GENERAL') {
                    hubs[idx].Type = 'LOCAL';
                }
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
                if (hub.Type === 'CENTRAL') {
                    $scope.hubs.push({key: hub.Name, value: hub.HubID});
                };
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
            $location.search('q', $scope.searchQuery);
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
            $rootScope.$emit('startSpin');
            Services2.deleteHub({
                id: id,
            }, {}).$promise.then(function(result) { 
                $rootScope.$emit('stopSpin'); 
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
        $scope.tableState = state;
        if ($scope.isFirstLoaded) {
            $scope.tableState.pagination.start = $scope.offset;
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        $scope.getHubs();
    }

    /**
     * Get all countries
     * 
     * @return {void}
     */
    $scope.getCountries = function(val) {
        return Services2.getCountries({
            search: val
        }).$promise.then(function(response){
            // limit ID only for now
            var countries = lodash.filter(response.data.Countries.rows, function(c){
                return c.ShortCode == 'ID';
            });
            countries = lodash.sortBy(countries, function (c) { 
                return c.Name.toLowerCase(); 
            });
            $scope.countries = countries;

            $scope.form.country = lodash.find($scope.countries, {
                CountryID: $scope.hub.CountryID
            });
        });
    };

    /**
     * Get all states
     * 
     * @return {void}
     */
    $scope.getStates = function(val) {
        if (!$scope.hub.CountryID) return;
        return Services2.getStates({
            countryID: $scope.hub.CountryID,
            search: val
        }).$promise.then(function(response){
            var states = lodash.sortBy(response.data.States.rows, function (s) { 
                return s.Name.toLowerCase(); 
            });
            $scope.states = states;
            
            $scope.form.state = lodash.find($scope.states, {
                StateID: $scope.hub.StateID
            });
        });
    };

    /**
     * Get all cities
     * 
     * @return {void}
     */
    $scope.getCities = function(val) {
        if (!$scope.hub.StateID) return;
        return Services2.getCities({
            stateID: $scope.hub.StateID,
            limit: 'all',
            search: val,
            status: 'all'
        }).$promise.then(function(response){
            var cities = lodash.sortBy(response.data.Cities.rows, function (city) { 
                return city.Name.toLowerCase(); 
            });
            $scope.cities = cities;

            $scope.form.city = lodash.find($scope.cities, {
                CityID: $scope.hub.CityID
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
        var paramsAdd = [];

        $scope.zipcodes.forEach(function(zip) {
            paramsAdd.push(zip.value);
        });

        if ($scope.deleteZipcodes.length > 0) {
            var url = config.url + 'hub/' + $stateParams.hubID + '/zipcode';
            $http({
                method: 'DELETE',
                url: url,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    zipCodes: $scope.deleteZipcodes
                }
            });
        }

        if (paramsAdd.length > 0) {
            Services2.saveZipcodes({
                hubID: $stateParams.hubID,
            }, {
                zipCodes: paramsAdd
            }).$promise.then(function(data) {
                SweetAlert.swal('Success', 'Zip Code updated', 'success');
                $rootScope.$emit('stopSpin');
            }).catch(function (e) {
                $rootScope.$emit('stopSpin');
                alert('Failed');
            });
        }
        
    }

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        getCompanies();
        $scope.getCountries();
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
