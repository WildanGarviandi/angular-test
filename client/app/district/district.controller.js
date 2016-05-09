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
            var district = {
                name: $scope.district.Name,
                city: $scope.district.City,
                province: $scope.district.Province,
                zipcodes: $scope.district.ZipCodes,
                lat: $scope.district.Latitude,
                lng: $scope.district.Longitude
            };

            $rootScope.$emit('startSpin');

            var create = function (district) {
            	return Services2.createDistrict(district).$promise;
            };

            var checkResult = function (result) {
                if (result.data.status === false) {
                    if (result.data.error.model === 'district') {
                        $rootScope.$emit('stopSpin');
                        alert(result.data.error.messages.join('\n'));
                    } else if (result.data.error.model === 'zipcode'){
                        $rootScope.$emit('stopSpin');
                        resolve(result.data.error.messages);
                    }
                } else {
                    resolve('No warning');
                }
            };

            create(district)
            	.then(checkResult)
            	.catch(function(e) {
                    $rootScope.$emit('stopSpin');
                    reject();
                });
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
            var checkResult = checkZipcodes($scope.district.ZipCodes);
            if (!checkResult.error) {
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
                    zipcodes: passedZipcodes
                };
                $rootScope.$emit('startSpin');

                var update = function (district) {
                    return Services2.updateDistrict(district).$promise;
                };

                var checkResult = function (result) {
                    if (result.error) {
                        $rootScope.$emit('stopSpin');
                        reject(result.error.join('\n'));
                    } else if ($scope.district.ZipCodes !== '') {
                        return Services2.addDistrictZipCodes(ZipCodes).$promise;
                    } else {
                        // no zipcode assigned
                        $rootScope.$emit('stopSpin');
                        resolve(); 
                    }       
                };

                var updateZipCodes = function (result) {
                    $rootScope.$emit('stopSpin');
                    if (result) {
                        if (result.data.status !== false) {
                            resolve('No Warning');
                        } else {
                            resolve(result.data.error.messages);
                        }
                    } else {
                        reject('Updating zipcode failed.');
                    }
                };

                update(district)
                    .then(checkResult)
                    .then(updateZipCodes)
                    .catch(function (e) {
                        $rootScope.$emit('stopSpin');
                        reject(e);
                    });
            } else {
                reject(checkResult.error);
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
        var zipcodes = [];
        $scope.zipcodes.forEach(function(zip) {
            if (zip.value !== '') {
                zipcodes.push(zip.value);
            }
        });
        Services2.addDistrictZipCodes({
            _id: $stateParams.districtID,
            zipcodes: zipcodes.toString()
        }).$promise.then(function(result) {
        	if (result.data.status === true) {
        		alert('ZipCodes successfully saved');
		        window.location = '/update-district/' + $stateParams.districtID;  
        	}
            $rootScope.$emit('stopSpin');
        });
    };

    var checkZipcodes = function (zipcodes) {
        zipcodes = zipcodes.split(',');
        var falseFormat = [];
        var passedZipcodes = zipcodes.filter(function (val) {
            if (val === '') { return false; }
            else if (val.length !== 5) { 
                falseFormat.push(val);
                return false;
            } else {
                return true;
            }
        });
        if (falseFormat) {
            var message = 'Found false zipcode format.\n';
            falseFormat.forEach(function (val) {
                message += (val + ', ');
            });
            message += 'must be 5 character long.';
            return { zipcode: null, error: message };
        }

        return { zipcode: passedZipcodes, error: null };
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
