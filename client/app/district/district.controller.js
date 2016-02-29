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
            $window
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
        window.location = '/add-district';
    };

    /**
     * Redirect to edit district page
     * 
     * @return {void}
     */
    $scope.editDistrict = function(id) {
        window.location = '/update-district/' + id;
    };

    /**
     * Redirect to manage zipcodes page
     * 
     * @return {void}
     */
    $scope.manageZipcodes = function(id) {
        window.location = '/district/' + id + '/zipcodes';
    };

    /**
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function() {
        $window.history.back();
    };


    // REQUEST PART

    /**
     * Make a request to creating district
     * 
     * @return callback
     */
    var createDistrict = function(callback) {
        var district = {
            name: $scope.district.Name,
            city: $scope.district.City,
            province: $scope.district.Province
        };
        console.log('update district', district);
        $rootScope.$emit('startSpin');
        Services.createDistrict(district).$promise.then(function (result) {
            if (result.error) {
                $rootScope.$emit('stopSpin');
                alert(result.error.join('\n'));
            } else {
                console.log('update district response', result);
                var ZipCodes = {
                    districtid: result.data.DistrictID,
                    zipcodes: $scope.district.ZipCodes
                };
                Services.addDistrictZipCodes(ZipCodes).$promise.then(function (status) {
                    $rootScope.$emit('stopSpin');
                    console.log('add distric zipcodes', status);
                    if (district) {
                        return callback(null, result);
                    } else {
                        return callback('failed');
                    }
                })
                .catch(function() {
                    $rootScope.$emit('stopSpin');
                    return callback('failed');
                });   
            }
                 
        })
        .catch(function() {
            $rootScope.$emit('stopSpin');
            return callback('failed');
        });
    };

    // TODO: make district update and zipcodes add in one request
    /**
     * Make a request to update district data
     * 
     * @return callback
     */
    var updateDistrict = function(callback) {
        var district = {
            _id: $stateParams.districtID,
            name: $scope.district.Name,
            city: $scope.district.City,
            province: $scope.district.Province
        };
        
        $rootScope.$emit('startSpin');
        Services.updateDistrict(district).$promise.then(function (result) {
            if (result.error) {
                $rootScope.$emit('stopSpin');
                alert(result.error.join('\n'));
            } else {
                if ($scope.district.ZipCodes !== '') {
                    var ZipCodes = {
                        districtid: $stateParams.districtID,
                        zipcodes: $scope.district.ZipCodes
                    };
                    Services.addDistrictZipCodes(ZipCodes).$promise.then(function (status) {
                        $rootScope.$emit('stopSpin');
                        if (district) {
                            return callback(null, result);
                        } else {
                            return callback('failed');
                        }
                    })
                    .catch(function() {
                        $rootScope.$emit('stopSpin');
                        return callback('failed');
                    });  
                } else {
                    $rootScope.$emit('stopSpin');
                    return callback(null, result);
                }
            }        
        })
        .catch(function() {
            $rootScope.$emit('stopSpin');
            return callback('failed');
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
        Services.getOneDistrict({
            _id: $scope.id,
        }).$promise.then(function(data) {
            $scope.district = data.district;
            $scope.type = {key: data.district.Type, value: data.district.Type};
            if (data.parent) {
                $scope.parent = {key: data.parent.Name, value: data.parent.DistrictID};
            }
            // If has zipcodes
            if ((typeof data.zipcodes.length) !== 'undefined') {
                $scope.zipcodes = [];
                $scope.district.ZipCodes = '';
                data.zipcodes.forEach(function(zip, idx) {
                    $scope.zipcodes.push({key: idx, value: zip.ZipCode});
                    if (idx === 0 ) {
                        $scope.district.ZipCodes = $scope.district.ZipCodes + zip.ZipCode;
                    } else {
                        $scope.district.ZipCodes = $scope.district.ZipCodes + ',' + zip.ZipCode;
                    }
                    
                });
            }
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
            q: $scope.reqSearchString
        };
        Services.getSomeDistricts(params).$promise.then(function(data) {
            $scope.districts = []; 
            data.districts.forEach(function(district) {
                $scope.districts.push({key: district.Name, value: district.DistrictID});
            });
            $scope.displayed = data.districts;
            $scope.isLoading = false;
            console.log(data.count);
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
            $scope.getDistricts();
        }
    };

    /**
     * Create single district
     * 
     * @return {void}
     */
    $scope.createDistrict = function() {
        createDistrict(function(err, district) {        
            if (district.status === false) {
                alert('error');
            }
            alert('Your district ID:' + district.data.DistrictID + ' has been successfully created.');
            $location.path('/district');
        });
    };

    /**
     * Update single district
     * 
     * @return {void}
     */
    $scope.updateDistrict = function() {
        console.log('update');
        updateDistrict(function(err, district) {
            console.log(district);
            if (district.status === false) {
                alert('error');
            }
            alert('Your district ID:' + district.data.DistrictID + ' has been successfully updated.');
            $location.path('/district');
        });
    };

    /**
     * Delete single district
     * 
     * @return {void}
     */
    $scope.deleteDistrict = function(id) {
        if ($window.confirm('Are you sure you want to delete this district?')) {
        Services.deleteDistrict({
            _id: id,
        }).$promise.then(function(result) {  
            console.log(result.status);
            alert('Success');
            $scope.getDistricts();
        }).catch(function() {
            alert('Failed');
        });
      }
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
        }).$promise.then(function(data) {
            alert('Success');
            window.location = '/update-district/' + $stateParams.districtID;
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
