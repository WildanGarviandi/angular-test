'use strict';

angular.module('adminApp')
    .controller('FleetCtrl', 
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
            $q,
            config,
            Upload,
            $timeout
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.fleet = {
        FirstName: '',
        LastName: '',
        PhoneNumber: '',
        Email: '',
        Password: '',
        CountryCode: config.countryCode,
        UserAddress : {
            Address1: '',
            Address2: '',
            Latitude: config.defaultLocation.Latitude,
            Longitude: config.defaultLocation.Longitude,
            City: '',
            State: '',
            Country: '',
            ZipCode: ''
        },
        StatusID: 2,
        CompanyDetail: {
            CompanyName: '',
            CompanyDescription: '',
            VatNumber: null,
            CCNNumber: null,
            WebsiteURL: ''
        }
    };

    $scope.status = {
        key: 'All',
        value: 'All'
    };

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;

    $scope.emailFormat = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
    $scope.phoneFormat = /^[+]?(\d{3}(-| )?\d{3}(-| )?\d{4}|\d{5,12}|}|[(]\d{3}[)](-| )?\d{3}(-| )?\d{4})$/;

    /**
     * Get status
     * 
     * @return {void}
     */
    function getStatus () {
        return $q(function (resolve) {
            Services2.getUserStatus().$promise.then(function(response) {
                $scope.statuses = []; 
                if ($stateParams.fleetID === undefined) {
                    $scope.statuses.push($scope.status);
                }
                response.data.Statuses.rows.forEach(function(status) {
                    $scope.statuses.push({key: status.StatusName, value: status.StatusId});
                });
                resolve();
            });
        });
    };

    // FLEET CRUD

    var createFleet = function (callback) {
        var fleet = {
            CompanyName: $scope.fleet.CompanyDetail.CompanyName,
            CompanyDescription: $scope.fleet.CompanyDetail.CompanyDescription,
            VatNumber: $scope.fleet.CompanyDetail.VatNumber,
            CCNNumber: $scope.fleet.CompanyDetail.CCNNumber,
            WebsiteURL: $scope.fleet.CompanyDetail.WebsiteURL,

            FirstName: $scope.fleet.FirstName,
            LastName: $scope.fleet.LastName,
            PhoneNumber: $scope.fleet.PhoneNumber,
            Email: $scope.fleet.Email,
            ProfilePicture: $scope.fleet.ProfilePicture,
            Password: $scope.fleet.Password,

            Latitude: $scope.webstore.UserAddress.Latitude,
            Longitude: $scope.webstore.UserAddress.Longitude,
            Address1: $scope.webstore.UserAddress.Address1,
            Address2: $scope.webstore.UserAddress.Address2,
            City: $scope.webstore.UserAddress.City,
            State: $scope.webstore.UserAddress.State,
            Country: $scope.webstore.UserAddress.Country,
            ZipCode: $scope.webstore.UserAddress.ZipCode,
        };
        $rootScope.$emit('startSpin');
        Services2.createFleet({
            id: $stateParams.fleetID
        }, fleet).$promise.then(function (response) {
            $rootScope.$emit('stopSpin');
            callback(null, response);
        })
        .catch(function (err) {
            $rootScope.$emit('stopSpin');
            callback(err);
        });
    };

    var updateFleet = function (callback) {
        var fleet = {
            CompanyName: $scope.fleet.CompanyDetail.CompanyName,
            CompanyDescription: $scope.fleet.CompanyDetail.CompanyDescription,
            VatNumber: $scope.fleet.CompanyDetail.VatNumber,
            CCNNumber: $scope.fleet.CompanyDetail.CCNNumber,
            WebsiteURL: $scope.fleet.CompanyDetail.WebsiteURL,

            FirstName: $scope.fleet.FirstName,
            LastName: $scope.fleet.LastName,
            PhoneNumber: $scope.fleet.PhoneNumber,
            Email: $scope.fleet.Email,
            ProfilePicture: $scope.fleet.ProfilePicture,
            Password: $scope.fleet.Password,

            Latitude: $scope.webstore.UserAddress.Latitude,
            Longitude: $scope.webstore.UserAddress.Longitude,
            Address1: $scope.webstore.UserAddress.Address1,
            Address2: $scope.webstore.UserAddress.Address2,
            City: $scope.webstore.UserAddress.City,
            State: $scope.webstore.UserAddress.State,
            Country: $scope.webstore.UserAddress.Country,
            ZipCode: $scope.webstore.UserAddress.ZipCode,
        };
        $rootScope.$emit('startSpin');
        Services2.updateFleet({
            id: $stateParams.fleetID
        }, fleet).$promise.then(function (response) {
            $rootScope.$emit('stopSpin');
            callback(null, response);
        })
        .catch(function (err) {
            $rootScope.$emit('stopSpin');
            callback(err);
        });
    };

    /**
     * Update single fleet
     * 
     * @return {void}
     */
    $scope.createFleet = function() {
        createFleet(function(err, fleet) {
            if (err) {
                alert('Error: '+ err.data.error.message );
            } else {
                alert(fleet.data.Fleet.UserID + ' has been successfully created.');
                $location.path('/fleets');
            } 
        });
    };/**
     * Update single fleet
     * 
     * @return {void}
     */
    $scope.updateFleet = function() {
        updateFleet(function (err, fleet) {
            if (err) {
                alert('Error: '+ err.data.error.message );
            } else {
                alert('Your fleet ID:' + fleet.data.Fleet.UserID + ' has been successfully updated.');
                $location.path('/fleets');
            } 
        });
    };

    /**
     * Get single fleet
     * 
     * @return {void}
     */
    function getFleetDetails () {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.fleetID;
        Services2.getOneFleet({
            id: $scope.id,
        }).$promise.then(function(data) {
            $scope.fleet = data.data.Fleet;
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    };

    /**
     * Get all fleets
     * 
     * @return {void}
     */
    function getFleets () {
        $rootScope.$emit('startSpin');

        lodash.each(variables, function (val) {
            $scope[val.model] = $location.search()[val.param] || $scope[val.model];
        });

        lodash.each(pickedVariables, function (val, key) {
            var value = $location.search()[val.model] || $scope[val.model][val.pick];
            var findObject = {};
            findObject[val.pick] = (parseInt(value)) ? parseInt(value) : value;
            $scope[val.model] = lodash.find($scope[val.collection], findObject);
        });

        $location.search('offset', $scope.offset);

        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            name: $scope.queryName,
            email: $scope.queryEmail,
            phone: $scope.queryPhone,
            status: $scope.status.value,
        };
        Services2.getFleets(params).$promise.then(function(data) {
            $scope.displayed = data.data.Fleets.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.Fleets.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    };

    // FILTERING

    // Here, model and param have same naming format
    var pickedVariables = {
        'Status': {
            model: 'status',
            pick: 'value',
            collection: 'statuses'
        }
    };

    // Generates
    // chooseStatus, choosePickupType, chooseOrderType
    lodash.each(pickedVariables, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;
            getFleets();  
        };
    });

    var variables = {
        'Name': {
            model: 'queryName',
            param: 'name'
        },
        'Phone': {
            model: 'queryPhone',
            param: 'phone'
        },
        'Email': {
            model: 'queryEmail',
            param: 'email'
        }
    };

    // Generates:
    // searchOrder, searchDriver, searchMerchant, searchPickup, searchDropoff,
    // searchSender, searchRecipient, searchFleet
    lodash.each(variables, function (val, key) {
        $scope['search' + key] = function(event){
            if ((event && event.keyCode === 13) || !event) {
                $location.search(val.param, $scope[val.model]);
                $scope.offset = 0;
                $scope.tableState.pagination.start = 0;
                getFleets();
            }
        };
    });

    // ON EDIT PAGE

    /**
     * Assign status to the chosen item on edit page
     * 
     * @return {void}
     */
    $scope.chooseStatusEdit = function(item) {
        $scope.fleet.Fleet.StatusID = item.value;
        $scope.status = item;
    };

    // REDIRECTING

    /**
     * Redirect to add fleet page
     * 
     * @return {void}
     */
    $scope.addFleet = function() {
        $location.path('/add-fleet');
    };

    /**
     * Redirect to edit fleet page
     * 
     * @return {void}
     */
    $scope.editFleet = function(id) {
        window.location = '/update-fleet/' + id;
    };

    /**
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function() {
        $window.history.back();
    };

    // MISCELLANEOUS

    $scope.uploadPic = function (file) {
        $rootScope.$emit('startSpin');
        if (file) {
            $scope.f = file;
            file.upload = Upload.upload({
                url: config.url + 'upload/picture',
                data: {file: file}
            })
            .then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    if (response.data.data && !response.data.error) {
                        $scope.uploadError = false;
                        $scope.fleet.ProfilePicture = response.data.data.Location;
                    } else {
                        $scope.uploadError = true;
                        alert('Uploading picture failed. Please try again');
                        $scope.errorMsg = 'Uploading picture failed. Please try again';
                    }
                    $rootScope.$emit('stopSpin');
                });
            }, function (response) {
                if (response.status > 0) {
                    $scope.errorMsg = response.status + ': ' + response.data;
                }
                $rootScope.$emit('stopSpin');
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };

    /**
     * Update address components
     * 
     * @return {void}
     */
    $scope.updateLocation = function(addressComponents) {
        $scope.fleet.UserAddress.Address1 = addressComponents.addressLine1;
        $scope.fleet.UserAddress.State = addressComponents.stateOrProvince;
        $scope.fleet.UserAddress.ZipCode = addressComponents.postalCode;
    }

    /**
     * Pick location from maps
     * 
     * @return {void}
     */
    $scope.locationPicker = function() {
        $('#maps').locationpicker({
            location: {latitude: $scope.fleet.UserAddress.Latitude, longitude: $scope.fleet.UserAddress.Longitude},   
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

    // INITIATION

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
        getStatus().then(getFleets);
    };

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        if ($state.current.name === 'app.update-fleet') {
            getFleetDetails();
            getStatus();
            setTimeout(function() {
                if ($scope.fleet.UserID === undefined) {
                    window.location = '/fleet';
                }
            }, 4000);
            $scope.updatePage = true;
            $scope.addPage = false;
        } else if ($state.current.name === 'app.add-fleet') {
            $scope.addPage = true;
        }
    };

    $scope.loadManagePage();

});
