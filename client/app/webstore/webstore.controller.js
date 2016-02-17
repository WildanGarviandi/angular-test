'use strict';

angular.module('adminApp')
    .controller('WebstoreCtrl', 
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

    $scope.webstore = {
        HubID: null,
        FirstName: '',
        LastName: '',
        PhoneNumber: '',
        Email: '',
        Password: '',
        Latitude: '',
        Longitude: '',
        CountryCode: '',
        UserAddress : {
            Address1: '',
            Address2: '',
            Latitude: -6.2115,
            Longitude: 106.8452,
            City: '',
            State: '',
            Country: '',
            ZipCode: ''
        },    
        SourceID: 1,
        RegistrationSourceKey: 0,
        ReferrerTypeID: 2,
        DeviceTypeID: 7,
        StatusID: 2,
        UserTypeID: 5
    };

    $scope.itemsByPage = 10;
    $scope.offset = 0;

    var createWebstore = function(callback) {
        var webstore = {
            HubID: $scope.webstore.HubID,
            FirstName: $scope.webstore.FirstName,
            LastName: $scope.webstore.LastName,
            PhoneNumber: $scope.webstore.PhoneNumber,
            Email: $scope.webstore.Email,
            Password: $scope.webstore.Password,
            Latitude: $scope.webstore.UserAddress.Latitude,
            Longitude: $scope.webstore.UserAddress.Longitude,
            CountryCode: $scope.webstore.CountryCode,
            UserAddress : {
                Address1: $scope.webstore.UserAddress.Address1,
                Address2: $scope.webstore.UserAddress.Address2,
                Latitude: $scope.webstore.UserAddress.Latitude,
                Longitude: $scope.webstore.UserAddress.Longitude,
                City: $scope.webstore.UserAddress.City,
                State: $scope.webstore.UserAddress.State,
                Country: $scope.webstore.UserAddress.Country,
                ZipCode: $scope.webstore.UserAddress.ZipCode
            }, 
            SourceID: 1,
            RegistrationSourceKey: 0,
            ReferrerTypeID: 2,
            DeviceTypeID: 7,
            StatusID: 2,
            UserTypeID: 5
        };
        console.log('create webstore', webstore);
        $rootScope.$emit('startSpin');
        Services.createWebstore(webstore).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            console.log('create webstore response', response);
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

    var updateWebstore = function(callback) {
        var webstore = {
            HubID: $scope.webstore.HubID,
            UserID: $stateParams.webstoreID,
            FirstName: $scope.webstore.FirstName,
            LastName: $scope.webstore.LastName,
            PhoneNumber: $scope.webstore.PhoneNumber,
            Email: $scope.webstore.Email,
            Password: $scope.webstore.Password,
            Latitude: $scope.webstore.UserAddress.Latitude,
            Longitude: $scope.webstore.UserAddress.Longitude,
            CountryCode: $scope.webstore.CountryCode,           
            UserAddress : {
                Address1: $scope.webstore.UserAddress.Address1,
                Address2: $scope.webstore.UserAddress.Address2,
                Latitude: $scope.webstore.UserAddress.Latitude,
                Longitude: $scope.webstore.UserAddress.Longitude,
                City: $scope.webstore.UserAddress.City,
                State: $scope.webstore.UserAddress.State,
                Country: $scope.webstore.UserAddress.Country,
                ZipCode: $scope.webstore.UserAddress.ZipCode
            }
        };
        console.log('update webstore', webstore);
        $rootScope.$emit('startSpin');
        Services.updateWebstore(webstore).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            console.log('update webstore response', response);
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
     * Redirect to add webstore page
     * 
     * @return {void}
     */
    $scope.addWebstore = function() {
        window.location = '/add-webstore';
    }

    /**
     * Redirect to edit webstore page
     * 
     * @return {void}
     */
    $scope.editWebstore = function(id) {
        window.location = '/update-webstore/' + id;
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
        $scope.webstore.UserAddress.Address1 = addressComponents.addressLine1;
        $scope.webstore.UserAddress.State = addressComponents.stateOrProvince;
        $scope.webstore.UserAddress.ZipCode = addressComponents.postalCode;
    }

    /**
     * Pick location from maps
     * 
     * @return {void}
     */
    $scope.locationPicker = function() {
        $('#maps').locationpicker({
            location: {latitude: $scope.webstore.UserAddress.Latitude, longitude: $scope.webstore.UserAddress.Longitude},   
            radius: null,
            inputBinding: {
                latitudeInput: $('#us2-lat'),
                longitudeInput: $('#us2-lon'),
                locationNameInput: $('#us2-address') 
            },
            enableAutocomplete: true,
            onchanged: function (currentLocation, radius, isMarkerDropped) {
                console.log($(this).locationpicker('map').location)
                var addressComponents = $(this).locationpicker('map').location.addressComponents;
                $scope.updateLocation(addressComponents);
            },
        });
    }

    /**
     * Get hub selection
     * 
     * @return {void}
     */
    $scope.getHubs = function() {
        Services.getAll().$promise.then(function(data) {
            $scope.hubs = []; 
            data.hubs.forEach(function(hub) {
                $scope.hubs.push({key: hub.Name, value: hub.HubID});
            }) 
        });
    }

    /**
     * Assign hub to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseHub = function(item) {
        $scope.webstore.HubID = item.value;
        $scope.hub = item;
    }

    /**
     * Get single webstore
     * 
     * @return {void}
     */
    $scope.getWebstoreDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.webstoreID;
        Services.getWebstoreDetails({
            _id: $scope.id,
        }).$promise.then(function(data) {
            $scope.webstore = data.User;
            if (data.hasHub) {
                $scope.hub = {key: data.User.WebstoreCompany.Hub.Name, value: data.User.WebstoreCompany.Hub.HubID};
            }
            if (data.hasAddress) {
                $scope.webstore.UserAddress = data.User.WebstoreCompany.UserAddress;
            } else {
                $scope.webstore.UserAddress = {};
                $scope.webstore.UserAddress.Latitude = -6.2115;
                $scope.webstore.UserAddress.Longitude = 106.8452; 
            }            
            $scope.locationPicker();
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get all webstores
     * 
     * @return {void}
     */
    $scope.getWebstores = function() {
        $rootScope.$emit('startSpin');
        if ($stateParams.query) {
            $scope.reqSearchString = $stateParams.query;
        }
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            count: $scope.itemsByPage,
            search: $scope.reqSearchString
        };
        Services.getWebstores(params).$promise.then(function(data) {
            $scope.displayed = data.webstores;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Add search params for getWebstores()
     * 
     * @return {void}
     */
    $scope.reqSearchString = '';
    $scope.search = function(event) {
        if ((event && event.keyCode === 13) || !event) {
            $scope.reqSearchString = $scope.searchQuery;
            $scope.getWebstores();
        };
    }

    /**
     * Create single webstore
     * 
     * @return {void}
     */
    $scope.createWebstore = function(form) {
        if(form.$valid) {
            createWebstore(function(err, webstore) {        
                if (webstore.status === false) {
                    alert('error');
                };
                alert('Your webstore ID:' + webstore.data.UserID + ' has been successfully created.')
                $location.path('/webstore');
            })        
        } else {
            alert("Please fill all required fields");
        }
    }

    /**
     * Update single webstore
     * 
     * @return {void}
     */
    $scope.updateWebstore = function(form) {
        if(form.$valid) {
            updateWebstore(function(err, webstore) {
                if (webstore.status === false) {
                    alert('error');
                }
                alert('Your webstore ID:' + webstore.data.UserID + ' has been successfully updated.')
                $location.path('/webstore');
            })
        } else {
            alert("Please fill all required fields");
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
        $scope.getWebstores();
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
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        $scope.getCountries();
        $scope.getHubs();
        if ($stateParams.webstoreID !== undefined) {
            $scope.getWebstoreDetails();
            $scope.updatePage = true;
            $scope.addPage = false;
        } else {
            $scope.addPage = true;
            $scope.locationPicker();
        }
    }

    $scope.loadManagePage();

  });
