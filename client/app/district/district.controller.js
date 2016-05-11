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
            $stateParams, 
            $location,
            $http, 
            $window,
            $q,
            config
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
     * Add zipcode field on manage-zip
     * 
     * @return {void}
     */
    $scope.addField = function() {
        $scope.zipcodes.push({ key: $scope.sumZipField, value: '' });
        $scope.sumZipField++;
    };

    /**
     * Remove zipcode field
     * 
     * @return {void}
     */
    $scope.deleteField = function(idx) {
        $scope.zipcodes.splice(idx, 1);
    };

    /**
     * Redirect to add district page
     * 
     * @return {void}
     */
    $scope.addDistrict = function() {
        $location.path('/add-district');
    };

    /**
     * Redirect to edit district page
     * 
     * @return {void}
     */
    $scope.editDistrict = function(id) {
        $location.path('/update-district/' + id);
    };

    /**
     * Redirect to manage zipcodes page
     * 
     * @return {void}
     */
    $scope.manageZipcodes = function(id) {
        $location.path('/district/' + id + '/zipcodes');
    };

    /**
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function() {
        $window.history.back();
    };

    /**
     * Pick location from maps
     * 
     * @return {void}
     */
    $scope.locationPicker = function() {
        if (!$scope.district.Latitude || !$scope.district.Longitude) {
            $scope.district.Latitude = config.defaultLocation.Latitude;
            $scope.district.Longitude = config.defaultLocation.Longitude;
        }
        $('#maps').locationpicker({
            location: {latitude: $scope.district.Latitude, longitude: $scope.district.Longitude},   
            radius: null,
            inputBinding: {
                latitudeInput: $('#us2-lat'),
                longitudeInput: $('#us2-lon')
            }
        });
    };

    // REQUEST PART

    /**
     * Make a request to creating district
     * 
     * @return callback
     */
    var createDistrict = function() {
        return $q(function (resolve, reject) {
            var zipcodes = $scope.district.ZipCodes.split(',');
            var check = checkZipcodes(zipcodes);
            if (!check.error) {
                var district = {
                    name: $scope.district.Name,
                    city: $scope.district.City,
                    province: $scope.district.Province,
                    zipcodes: check.zipcodes,
                    lat: $scope.district.Latitude,
                    lng: $scope.district.Longitude
                };

                $rootScope.$emit('startSpin');

                var create = function (district) {
                    return Services2.createDistrict(district).$promise;
                };

                var checkResult = function (result) {
                    if (result.data.district) {
                        resolve('No warning');
                    } else {
                        reject('Unknown error.');
                    }
                };

                create(district)
                    .then(checkResult)
                    .catch(function(e) {
                        $rootScope.$emit('stopSpin');
                        reject(e.data.error.message);
                    });
            } else {
                reject(check.error);
            }
            
        });
    };

    // TODO: make district update and zipcodes add in one request
    /**
     * Make a request to update district data
     * 
     * @return callback
     */
    var updateDistrict = function() {
        return $q(function (resolve, reject) {
            var zipcodes = $scope.district.ZipCodes.split(',');
            var check = checkZipcodes(zipcodes);
            if (!check.error) {
                var district = {
                    _id: $stateParams.districtID,
                    name: $scope.district.Name || '',
                    city: $scope.district.City,
                    province: $scope.district.Province,
                    lat: $scope.district.Latitude,
                    lng: $scope.district.Longitude
                };
                var ZipCodes = {
                    _id: $stateParams.districtID,
                    zipcodes: check.zipcodes
                };
                $rootScope.$emit('startSpin');

                var update = function (district) {
                    return Services2.updateDistrict(district).$promise;
                };

                var checkResult = function (result) {
                    if (!result.data.district) {
                        $rootScope.$emit('stopSpin');
                        reject();
                    } 

                    if (check.zipcodes.length !== 0) {
                        return Services2.addDistrictZipCodes(ZipCodes).$promise;
                    } else {
                        // no zipcode assigned
                        $rootScope.$emit('stopSpin');
                        resolve(); 
                    }       
                };

                var updateZipCodes = function (result) {
                    console.log('res', result);
                    $rootScope.$emit('stopSpin');
                    if (result.data.zipcodes) {
                        resolve('No Warning');
                    } else {
                        reject('Updating zipcodes failed');
                    }
                };

                update(district)
                    .then(checkResult)
                    .then(updateZipCodes)
                    .catch(function (e) {
                        $rootScope.$emit('stopSpin');
                        reject(e.data.error.message);
                    });
            } else {
                reject(check.error);
            }
        });
    };

    /**
     * Get single district for updating data
     * 
     * @return {void}
     */
    $scope.getDistrictDetails = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        $scope.id = $stateParams.districtID;
        Services2.getDistrict({
            id: $scope.id,
        }).$promise.then(function(result) {
            console.log('district', result.data.district);
            $scope.district = result.data.district;
            $scope.type = {key: result.data.district.Type, value: result.data.district.Type};
            // If has zipcodes
            if ((typeof result.data.district.DistrictZipCodes.length) !== 'undefined') {
                $scope.zipcodes = [];
                $scope.district.ZipCodes = '';
                result.data.district.DistrictZipCodes.forEach(function(zip, idx) {
                    $scope.zipcodes.push({key: idx, value: zip.ZipCode});
                    if (idx === 0 ) {
                        $scope.district.ZipCodes = $scope.district.ZipCodes + zip.ZipCode;
                    } else {
                        $scope.district.ZipCodes = $scope.district.ZipCodes + ',' + zip.ZipCode;
                    }
                });
            }
            $scope.locationPicker();
            $scope.isLoading = false;
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
        if ($stateParams.query) {
            $scope.reqSearchString = $stateParams.query;
        }
        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage
        };
        Services2.getManyDistricts(params).$promise.then(function(result) {
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
        Services2.getManyDistricts(params).$promise.then(function(result) {
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

    /**
     * Create single district
     * 
     * @return {void}
     */
    $scope.createDistrict = function() {
        createDistrict()
	        .then(function (message) {        
	        	alert('District successfully created.\n' + message);
	            $location.path('/district');
	        })
	        .catch(function (e) {
	            alert('CREATING DISTRICT FAILED.\n' + e);
	        });
    };

    /**
     * Update single district
     * 
     * @return {void}
     */
    $scope.updateDistrict = function() {
        updateDistrict()
	        .then(function (message) {      
	        	alert('District successfully updated.\n' + message);
	            $location.path('/district');
	        })
	        .catch(function (e) {
	            alert('UPDATING DISTRICT FAILED.\n' + e);
	        });
    };
    
    /**
     * Save zip codes
     * 
     * @return {void}
     */
    $scope.addZipCode = function() {
        $rootScope.$emit('startSpin');
        var zipcodes  = $scope.zipcodes.map(function (zipcode) {
            return zipcode.value;
        });

        var check = checkZipcodes(zipcodes);
        if (!check.error) {
            Services2.addDistrictZipCodes({
                _id: $stateParams.districtID,
                zipcodes: check.zipcodes
            }).$promise
            .then(function (result) {
                if (result.data.zipcodes) {
                    alert('Zip Codes successfully saved');
                    window.location = '/update-district/' + $stateParams.districtID;  
                }
                $rootScope.$emit('stopSpin');
            })
            .catch(function (e) {
                alert('UPDATING ZIPCODES FAILED.\n' + e.data.error.message);
                $rootScope.$emit('stopSpin');
            });
        } else {
            alert('UPDATING ZIPCODES FAILED.\n' + check.error);
            $rootScope.$emit('stopSpin');
        }
        
    };

    var checkZipcodes = function (zipcodes) {
        var falseFormat = [];
        var passedZipcodes = zipcodes.filter(function (val) {
            if (val === '') { return false; }
            else if (val.length !== 5) { 
                falseFormat.push({ value: val, cause: 'length'});
                return false;
            } else if (isNaN(val)) {
                falseFormat.push({ value: val, cause: 'NaN'});
                return false;
            } else {
                return true;
            }
        });
        if (falseFormat.length !== 0) {
            var message = 'Found false zipcode format.\n';
            var lengthError = '';
            var nanError = '';
            falseFormat.forEach(function (val) {
                if (val.cause === 'length') {
                    lengthError += (val.value + ', ');
                } else {
                    nanError += (val.value + ', ');
                }
            });
            if (lengthError) { lengthError += 'must be 5 character long.\n'; }
            if (nanError) { nanError += 'not a number.\n'; }

            message += (lengthError + nanError);

            return { zipcode: null, error: message };
        }

        return { zipcodes: passedZipcodes, error: null };
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
        $scope.getDistricts();
        $scope.isFirstLoaded = true;
    };

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        if ($state.includes('app.update-district') || 
            $state.includes('app.manage-district-zipcodes')) {
            $scope.getDistrictDetails();
            $scope.updatePage = true;
            $scope.addPage = false;
        } else if ($state.includes('app.add-district')) {
            $scope.locationPicker();
            $scope.addPage = true;
            $scope.updatePage = false;
        } else {
            $scope.addPage = false;
            $scope.updatePage = false;
        }
    };

    $scope.loadManagePage();
  });
