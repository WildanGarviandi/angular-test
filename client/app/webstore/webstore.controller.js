'use strict';

angular.module('adminApp')
    .controller('WebstoreCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope, 
            Services,
            Services2,
            Webstores,
            moment, 
            lodash, 
            $state, 
            $stateParams,
            $location, 
            $http, 
            $window,
            Upload,
            config,
            $timeout,
            ngDialog
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.statusList = [
        { key: '', text: 'ALL'}, 
        { key: 1, text: 'PENDING'}, 
        { key: 2, text: 'ACTIVATED'}
    ];
    $scope.statusFilter = $scope.statusList[0];

    $scope.postPaidPaymentList = [
        { key: 'all', text: 'ALL'},
        { key: 1, text: 'Postpaid'},
        { key: 0, text: 'Prepaid'},
    ];
    $scope.postPaidPaymentFilter = $scope.postPaidPaymentList[0];

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
            Latitude: config.defaultLocation.Latitude,
            Longitude: config.defaultLocation.Longitude,
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

    $scope.searchFilter = {};
    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.uploadError = false;

    $scope.cutoffTimes = [];
    for (var i = 0; i < 24; i++) {
        $scope.cutoffTimes.push({
            value: i,
            active: false
        });
    }

    function CleanPhoneNumber(phone) {
      if(phone.indexOf('0') == 0) {
        phone = phone.substr(1);
      }

      if(phone.indexOf('+') == 0) {
        phone = phone.substr(1);
      }

      if(phone.indexOf('6') == 0) {
        phone = phone.substr(2);
      }

      return phone;
    }


    var createWebstore = function(callback) {
        var webstore = {
            PostPaidPayment: $scope.webstore.PostPaidPayment,
            AllowCOD: $scope.webstore.AllowCOD,
            HubID: $scope.webstore.HubID,
            FirstName: $scope.webstore.FirstName,
            LastName: $scope.webstore.LastName,
            PhoneNumber: CleanPhoneNumber($scope.webstore.PhoneNumber),
            Email: $scope.webstore.Email,
            Password: $scope.webstore.Password,
            Latitude: $scope.webstore.UserAddress.Latitude,
            Longitude: $scope.webstore.UserAddress.Longitude,
            CountryCode: $scope.webstore.CountryCode,
            Address1: $scope.webstore.UserAddress.Address1,
            Address2: $scope.webstore.UserAddress.Address2,
            City: $scope.webstore.UserAddress.City,
            State: $scope.webstore.UserAddress.State,
            Country: $scope.webstore.UserAddress.Country,
            ZipCode: $scope.webstore.UserAddress.ZipCode,
            Categories: $scope.webstore.WebstoreCompany.Categories,
            AverageWeights: $scope.webstore.WebstoreCompany.AverageWeights,
            PickupOptions: $scope.webstore.WebstoreCompany.PickupOptions,
            CODCommission: $scope.webstore.WebstoreCompany.CODCommission,
            SourceID: 1,
            RegistrationSourceKey: 0,
            ReferrerTypeID: 2,
            DeviceTypeID: 7,
            StatusID: 2,
            UserTypeID: 5,
        };
        $rootScope.$emit('startSpin');
        Webstores.createWebstore(webstore).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');

            if (response) {
                return callback(null, response.data)
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
            PostPaidPayment: $scope.webstore.PostPaidPayment,
            AllowCOD: $scope.webstore.AllowCOD,
            HubID: $scope.webstore.HubID,
            UserID: $stateParams.webstoreID,
            FirstName: $scope.webstore.FirstName,
            LastName: $scope.webstore.LastName,
            PhoneNumber: CleanPhoneNumber($scope.webstore.PhoneNumber),
            Email: $scope.webstore.Email,
            Password: $scope.webstore.Password,
            ProfilePicture: $scope.webstore.ProfilePicture,
            Latitude: $scope.webstore.UserAddress.Latitude,
            Longitude: $scope.webstore.UserAddress.Longitude,
            CountryCode: $scope.webstore.CountryCode,
            Address1: $scope.webstore.UserAddress.Address1,
            Address2: $scope.webstore.UserAddress.Address2,
            City: $scope.webstore.UserAddress.City,
            State: $scope.webstore.UserAddress.State,
            Country: $scope.webstore.UserAddress.Country,
            ZipCode: $scope.webstore.UserAddress.ZipCode,
            Categories: $scope.webstore.WebstoreCompany.Categories,
            AverageWeights: $scope.webstore.WebstoreCompany.AverageWeights,
            PickupOptions: $scope.webstore.WebstoreCompany.PickupOptions,
            CODCommission: $scope.webstore.WebstoreCompany.CODCommission,
        };
        $rootScope.$emit('startSpin');
        Webstores.updateWebstore({_id: $stateParams.webstoreID, webstore: webstore}).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            if (response) {
                return callback(null, response.data)
            } else {
                return callback('failed', {});
            }
        })
        .catch(function(err) {
            $rootScope.$emit('stopSpin');
            return callback(err.statusText, {});
        });
    }

    /**
     * Redirect to add webstore page
     * 
     * @return {void}
     */
    $scope.addWebstore = function() {
        $location.path('/add-webstore');
    }

    /**
     * Redirect to edit webstore page
     * 
     * @return {void}
     */
    $scope.editWebstore = function(id) {
        $location.path('/update-webstore/' + id);
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
        Services2.getHubs().$promise.then(function(data) {
            $scope.hubs = [];
            data.data.Hubs.rows.forEach(function(hub) {
                $scope.hubs.push({key: hub.Name, value: hub.HubID});
            });
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
     * Get postPaidPayment selection
     * 
     * @return {void}
     */
    $scope.getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
            $scope.payments = data.postPaidPayment;
        });
    }

    /**
     * Assign postPaidPayment to the chosen item
     * 
     * @return {void}
     */
    $scope.choosePayment = function(item) {
        $scope.webstore.PostPaidPayment = item.value;
        $scope.payment = item;
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
        Webstores.getWebstoreDetails({
            id: $scope.id,
        }).$promise.then(function(result) {
            var data = result.data;
            $scope.parentWebstore = data.Parent;
            $scope.childrenWebstore = data.Children;
            $scope.webstore = data.User;
            $scope.webstore.PostPaidPayment = data.User.WebstoreCompany.PostPaidPayment;
            $scope.payment = $scope.payments[~~data.User.WebstoreCompany.PostPaidPayment];
            $scope.webstore.AllowCOD = data.User.WebstoreCompany.AllowCOD;
            if (data.hasHub) {
                $scope.hub = {key: data.User.WebstoreCompany.Hub.Name, value: data.User.WebstoreCompany.Hub.HubID};
                $scope.webstore.HubID = data.User.WebstoreCompany.Hub.HubID;
            }
            if (data.hasAddress) {
                $scope.webstore.UserAddress = data.User.WebstoreCompany.UserAddress;
            } else {
                $scope.webstore.UserAddress = {
                    Latitude: -6.2115, 
                    Longitude: 106.8452
                };
            }

            $scope.webstore.WebstoreCompany.CODCommission = Math.round($scope.webstore.WebstoreCompany.CODCommission*1000)/1000;
            $scope.locationPicker();
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.paginationChildWebstore = function(value) {
        $scope.offset = Math.ceil(value);
    }

    /**
     * Get all webstores
     * 
     * @return {void}
     */
    $scope.getWebstores = function() {
        $rootScope.$emit('startSpin');
        var paramsQuery = {
            'name': 'name',
            'email': 'email',
            'address': 'address'
        };
        lodash.each(paramsQuery, function (val, key) {
            $scope.searchFilter[val] = $location.search()[key] || $scope.searchFilter[val];
        });

        var paramsValue = {
            'statusFilter': 'statusList',
            'postPaidPaymentFilter': 'postPaidPaymentList',
        };
        lodash.each(paramsValue, function (val, key) {
            var text = $location.search()[key] || $scope[key].text;
            $scope[key] = lodash.find($scope[val], { 'text': text });
        });

        $location.search('offset', $scope.offset);
        $scope.isLoading = true;
        var params = {
            name: $scope.searchFilter.name,
            email: $scope.searchFilter.email,
            address: $scope.searchFilter.address,
            status: $scope.statusFilter.key,
            postPaidPayment: $scope.postPaidPaymentFilter.key,
            offset: $scope.offset,
            limit: $scope.itemsByPage
        };
        Webstores.getWebstore(params).$promise.then(function(data) {
            $scope.displayed = _.map(data.data.webstores, function(webstore) {
                return _.assign({}, webstore.webstore, {
                    RegistrationStatus: webstore.status
                });
            });
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        }).catch(function (err) {
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
            $scope.searchFilter.name = $scope.searchQuery;
            $scope.filterWebstores();
        };
    }

    function AlertFormInvalidation(form) {
        if(form.codCommission.$invalid) {
            alert('Please fill COD Commission between 1-100');
        } else {
            alert('Please fill all required fields');
        }
    }

    /**
     * Create single webstore
     * 
     * @return {void}
     */
    $scope.createWebstore = function(form) {
        if(form.$valid) {
            createWebstore(function(err, result) {        
                if (result.status === false) {
                    alert('error');
                };
                alert('Your webstore ID:' + result.webstore.UserID + ' has been successfully created.')
                $location.path('/webstore');
            })        
        } else {
            AlertFormInvalidation(form);
        }
    }

    /**
     * Update single webstore
     * 
     * @return {void}
     */
    $scope.updateWebstore = function(form) {
        if(form.$valid) {
            updateWebstore(function(err, result) {
                if (!result.status) {
                    alert(err);
                } else {
                    alert('Your webstore ID:' + result.webstore.UserID + ' has been successfully updated.')
                    $location.path('/webstore');
                }
            })
        } else {
            AlertFormInvalidation(form);
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
        $scope.getUnverifiedNumber();
        $scope.getWebstores();
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
            return response.data.Countries.rows.map(function(item){
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
        return Services2.getStates({
            search: val
        }).$promise.then(function(response){
            return response.data.States.rows.map(function(item){
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
        $scope.getDefaultValues();
        if ($state.current.name === 'app.update-webstore') {
            $scope.getWebstoreDetails();
            setTimeout(function() {
                if ($scope.webstore.UserID === undefined) {
                    window.location = '/webstore';
                }
            }, 4000);
            $scope.updatePage = true;
            $scope.addPage = false;
        } else if ($state.current.name === 'app.add-webstore') {
            $scope.addPage = true;
            $scope.locationPicker();
        }
    }

    $scope.chooseRegistrationStatus = function(item) {
        $location.search('statusFilter', item.text);
        $scope.statusFilter = item;
        $scope.offset = 0;
        $scope.itemsByPage = 10;
        $scope.tableState.pagination.start = 0;
        $scope.searchFilter = {};
        $scope.getWebstores();
    }

    $scope.choosePostPaidPayment = function(item){
        $location.search('postPaidPaymentFilter', item.text);
        $scope.postPaidPaymentFilter = item;
        $scope.filterWebstores();
    }

    $scope.showUnverified = function() {
        $scope.chooseRegistrationStatus($scope.statusList[1]);
    }

    $scope.getUnverifiedNumber = function() {
        var params = {
            status: 1,
            limit: 1,
            offset: 0
        };

        Webstores.getWebstore(params).$promise.then(function(data) {
            $scope.unverifiedCount = data.data.count;
        });
    }

    $scope.verifyWebstore = function() {
        if(!$scope.webstore.HubID) {
            alert('Please select hub for this webstore. Hub information is needed prior to verification.');
            return;
        }

        $rootScope.$emit('startSpin');
        Webstores.verifyWebstore({_id: $stateParams.webstoreID, HubID: $scope.webstore.HubID}).$promise.then(function(response) {
            $rootScope.$emit('stopSpin');
            if (response) {
                alert('Your webstore ID:' + $stateParams.webstoreID + ' has been successfully verified.');
                $location.path('/webstore');
            } else {
                alert('Verify failed.');
            }
        })
        .catch(function(err) {
            $rootScope.$emit('stopSpin');
            alert('Verify failed.');
        });
    }

    $scope.bucket = function (webstoreID) {
        $scope.webstoreID = webstoreID;
        var params = {
            id: webstoreID
        };

        Services2.getCutoffTimes(params).$promise
        .then(function (result) {
            var cutoff = result.data.CutoffTimes;
            _.each($scope.cutoffTimes, function (time, index, array){
                array[index].active = false;
            });
            _.each(cutoff, function (time) {
                $scope.cutoffTimes[time.BroadcastTime].active = true;
            });

            $scope.chunkedBroadcastTime = [];
            for (var i = 0, j = $scope.cutoffTimes.length; i < j; i += 6) {
                $scope.chunkedBroadcastTime.push($scope.cutoffTimes.slice(i, i+6));
            }

            ngDialog.open({
                template: 'deliverySettingsTemplate',
                scope: $scope,
                className: 'ngdialog-theme-default delivery-settings'
            });
        });
    };

    $scope.setCutoffTimes = function () {
        var cutoffTimes = $scope.cutoffTimes.filter(function (time) {
            return (time.active) ? true : false;
        });
        var params = {
            _id: $scope.webstoreID,
            cutoffTimes: cutoffTimes
        };
        Services2.setCutoffTimes(params).$promise
        .then(function (result) {
            alert('Cutoff Time successfully updated');
        })
        .catch(function (e) {
            alert('Updating Cutoff Time failed');
        });
    };

    $scope.filterWebstores = function () {
        $location.search('name', $scope.searchFilter.name);
        $location.search('email', $scope.searchFilter.email);
        $location.search('address', $scope.searchFilter.address);
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getWebstores();
    }

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
                        $scope.webstore.ProfilePicture = response.data.data.Location;
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

    $scope.loadManagePage();

    /**
     * Refresh list with user input request
     * 
     * @return {void}
     */
    $scope.refresh = function(item) {
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getWebstores(); 
    }

    /**
     * Clear Filter
     * 
     * @return {void}
     */
    $scope.clearFilter = function(item) {
        $state.reload();
    }
    
  });
