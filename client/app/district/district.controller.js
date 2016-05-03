'use strict';

angular.module('adminApp')
    .controller('DistrictCtrl', 
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
            $window,
            $q
        ) {

    Auth.getCurrentUser().$promise.then(function(data) {
        $scope.user = data.profile;
    });

    $scope.district = {
        DistrictID: null,
        Name: '',
        City: '',
        Province: '',
        ZipCodes: ''
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
            $scope.district.Latitude = -6.2115;
            $scope.district.Longitude = 106.8452;
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
            	return Services.createDistrict(district).$promise;
            };

            var checkResult = function (result) {
                if (result.status === false) {
                    if (result.error.model === 'district') {
                        $rootScope.$emit('stopSpin');
                        alert(result.error.messages.join('\n'));
                    } else if (result.error.model === 'zipcode'){
                        $rootScope.$emit('stopSpin');
                        resolve(result.error.messages);
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
            var district = {
                _id: $stateParams.districtID,
                name: $scope.district.Name,
                city: $scope.district.City,
                province: $scope.district.Province,
                lat: $scope.district.Latitude,
                lng: $scope.district.Longitude
            };
            var ZipCodes = {
                districtid: $stateParams.districtID,
                zipcodes: $scope.district.ZipCodes
            };
            
            $rootScope.$emit('startSpin');

            var update = function (district) {
            	return Services.updateDistrict(district).$promise;
            };

            var checkResult = function (result) {
                if (result.error) {
                    $rootScope.$emit('stopSpin');
                    alert(result.error.join('\n'));
                } else if ($scope.district.ZipCodes !== '') {
					return Services.addDistrictZipCodes(ZipCodes).$promise;
                } else {
                    // no zipcode assigned
                    $rootScope.$emit('stopSpin');
                    resolve(); 
                }        
            };

            var updateZipCodes = function (result) {
                $rootScope.$emit('stopSpin');
				if (result) {
					if (result.status !== false) {
	                    resolve('No Warning');
	                } else {
	                    resolve(result.error.messages);
	                }
				} else {
                    reject();
                }
            };

            update(district)
            	.then(checkResult)
            	.then(updateZipCodes)
            	.catch(function () {
            		$rootScope.$emit('stopSpin');
                	reject();
            	});
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
        Services.getOneDistrictData({
            id: $scope.id,
        }).$promise.then(function(data) {
            console.log('district', data.district);
            $scope.district = data.district;
            $scope.type = {key: data.district.Type, value: data.district.Type};
            // If has zipcodes
            if ((typeof data.district.DistrictZipCodes.length) !== 'undefined') {
                $scope.zipcodes = [];
                $scope.district.ZipCodes = '';
                data.district.DistrictZipCodes.forEach(function(zip, idx) {
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
            limit: $scope.itemsByPage,
            zipcode: false
        };
        Services.getAllDistrictsData(params).$promise.then(function(data) {
            $scope.districts = []; 
            data.districts.forEach(function(district) {
                $scope.districts.push({key: district.Name, value: district.DistrictID});
            });
            $scope.displayed = data.districts;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.count / $scope.tableState.pagination.number);
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
            q: $scope.reqSearchString
        };
        Services.searchDistricts(params).$promise.then(function(data) {
            $scope.districts = []; 
            data.districts.forEach(function(district) {
                $scope.districts.push({key: district.Name, value: district.DistrictID});
            });
            $scope.displayed = data.districts;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.count / $scope.tableState.pagination.number);
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
	        .catch(function () {
	            alert('CREATING DISTRICT FAILED');
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
	        .catch(function () {
	            alert('UPDATING DISTRICT FAILED');
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
        Services.addDistrictZipCodes({
            districtid: $stateParams.districtID,
            zipcodes: zipcodes.toString()
        }).$promise.then(function(result) {
        	if (result.status === true) {
        		alert('ZipCodes successfully saved');
		        window.location = '/update-district/' + $stateParams.districtID;  
        	}
            $rootScope.$emit('stopSpin');
        });
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
        if ($stateParams.districtID !== undefined) {
            $scope.getDistrictDetails();
            $scope.updatePage = true;
            $scope.addPage = false;
        } else {
             $scope.addPage = true;
        }
    };

    $scope.loadManagePage();

  });
