'use strict';

angular.module('adminApp')
    .controller('FleetZipcodeCtrl', 
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
            ngDialog,
            $timeout
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.fleet = [];
    $scope.fleetOnModal = [];

    $scope.table = {};
    $scope.table.colHeaders = true;
    $scope.table.beforeSafe = [];
    $scope.table.error = '';
    $scope.table.success = '';

    $scope.status = {
        key: 'All',
        value: 'All'
    };

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;

    // FLEET CRUD

    /**
     * Calls creating fleet endpoint
     * 
     * @return {Object} - Promise of Fleet Data
     */
    function createFleet () {
        return $q(function (resolve, reject) {
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
                Password: $scope.fleet.Password
            };
            $rootScope.$emit('startSpin');
            Services2.createFleet({
                id: $stateParams.fleetID
            }, fleet).$promise.then(function (response) {
                $rootScope.$emit('stopSpin');
                resolve(response);
            })
            .catch(function (err) {
                $rootScope.$emit('stopSpin');
                reject(err);
            });
        });
    }

    /**
     * Create single fleet
     * 
     * @return {void}
     */
    $scope.createFleet = function() {
        createFleet().then(function (fleet) {
            $window.alert(fleet.data.Fleet.FirstName + ' ' + fleet.data.Fleet.LastName + 
                ' has been successfully created.');
            $location.path('/fleets');
        }).catch(function (err) {
            $window.alert('Error: '+ err.data.error.message );
        });
    };

    /**
     * Get all companies
     * 
     * @return {Object} Promise
     */
    var getFleets = function () {
        $scope.fleets = [{
            User: {
                FleetManagerID: '0'
            },
            FleetName: 'All'
        }];
        $scope.fleetsOnModal = [{
            User: {
                FleetManagerID: '0'
            },
            FleetName: 'Select Fleet'
        }];
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            var params = {};
            params.limit = 1;

            Services2.getFleets(params).$promise.then(function(result) {
                params.limit = result.data.Fleets.count;
                Services2.getFleets(params).$promise.then(function(result) {
                    lodash.sortBy(result.data.Fleets.rows, function (i) {
                        var fleet = {
                            FleetManagerID: i.UserID,
                            FleetName: i.CompanyDetail.CompanyName.toLowerCase() + ' ( ' + i.FirstName + ' ' + i.LastName + ' )'
                        };
                        $scope.fleets.push(fleet);
                    });
                    $scope.fleet = $scope.fleets[0];
                    $scope.fleetOnModal = $scope.fleetsOnModal[0];
                    $rootScope.$emit('stopSpin');
                    resolve();
                });
            });
        });
    };

    /**
     * Choose fleet on list page
     * @param  {[type]} fleet [description]
     * @return {void}
     */
    $scope.chooseFleet = function (fleet) {
        $scope.fleet = fleet;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        getFleetZipCodes();
    };

    /**
     * Choose fleet on modal on list page
     * @param  {[type]} fleet [description]
     * @return {void}
     */
    $scope.chooseFleetOnModal = function (fleet) {
        $scope.fleetOnModal = fleet;
        getFleetZipCodesOnModal(fleet.FleetManagerID);
    };

    /**
     * Get all fleet zipcodes data
     * 
     * @return {void}
     */
    function getFleetZipCodes () {
        $rootScope.$emit('startSpin');
        $location.search('offset', $scope.offset);

        $scope.isLoading = true;
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            fleetManagerID: $scope.fleet.FleetManagerID
        };
        Services2.getFleetZipCodes(params).$promise.then(function(data) {
            $scope.fleetZipCodesFound = data.data.count;
            $scope.displayed = data.data.rows;
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Show add new zip code modals
     * 
     * @return {void}
     */
    $scope.showAddZipcodeModal = function() {
        ngDialog.close();
        $scope.table.data = [];
        $scope.fleetOnModal = $scope.fleetsOnModal[0];
        return ngDialog.open({
            template: 'addZipcodeModal',
            scope: $scope
        });
    }

    $scope.closeAddZipcodeModal = function() {
        ngDialog.close();
    }

    // ADD NEW USING TABLE 
    /**
     * Build / define column definition for ngHandsontable
     * 
     */
    var buildColumnDefs = function () {
        var colHeaders = ['Zip Code','HANDLING PRICE'];
        var rowHeaders = [];
        $scope.table.colHeaders = colHeaders;
        $scope.table.rowHeaders = rowHeaders;
    };

    /**
     * Get all fleet zipcodes data
     * 
     * @return {void}
     */
    function getFleetZipCodesOnModal(fleetManagerID) {
        $rootScope.$emit('startSpin');
        //$location.search('offset', $scope.offset);


        $scope.table.data = [];
        $scope.table.columns = [{
            data: 0,
            title: 'ZIP CODE',
            type: 'numeric'
        },
        {
            data: 1,
            title: 'HANDLING PRICE',
            type: 'numeric'
        }];

        $scope.isLoading = true;
        var params = {
            //offset: $scope.offset,
            //limit: $scope.itemsByPage,
            fleetManagerID: fleetManagerID
        };
        Services2.getFleetZipCodes(params).$promise.then(function(data) {
            data.data.rows.forEach(function(val, idx) {
                var rowContents = [];
                rowContents[0] = val.ZipCode;
                rowContents[1] = (val.FleetPrice) ? val.FleetPrice.Price : 0;
                $scope.table.data.push(rowContents);
            });
            $scope.table.data.push([]);
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    $scope.addNewRow = function() {
        $scope.table.data.push([]);
    }

    $scope.removeNewRow = function() {
        $scope.table.data.pop();
    }

    /**
     * Do function before cell changed
     * Check initial state is integer or not
     */
    $scope.beforeChange = function (changes, source) {
        return true;
    }

    var paramsAfterChange = [];
    /**
     * Do function after cell changed
     * 
     */
    $scope.afterChange = function (changes) {
        if (!changes) {
            return;
        }

        $.each(changes, function (index, element) {
            var change = element;
            if (typeof paramsAfterChange[change[0]] === 'undefined') {
                paramsAfterChange[change[0]] = {};
            }
            
            if (change[1] === 0) {
                paramsAfterChange[change[0]].zipcode = change[3];
            }

            if (change[1] === 1) {
                paramsAfterChange[change[0]].price = change[3];
                var params = {
                    zipCode: $scope.table.data[change[0]][0],
                    price: change[3]
                };
                collectDataBeforeSafe(params);
            }
        });
        console.log($scope.table.beforeSafe);
        //$scope.table.beforeSafe = paramsAfterChange;
    }

    /**
     * Collect all changed Cell before push to Server
     * 
     */
    function collectDataBeforeSafe(data) {
        var isDataExist = false;
        var indexKey;
        
        $scope.table.error = '';
        
        if (!parseInt(data.price) && data.price) {
            $scope.table.error = 'Invalid Price Number';
        };

        isDataExist = lodash.find($scope.table.beforeSafe, function(val, key){ 
            if(val.zipcode == data.zipcode){
                indexKey = key;
                return true;
            }; 
        });

        if (!isDataExist) {
            $scope.table.beforeSafe.push(data);
        } else {
            $scope.table.beforeSafe.splice(indexKey, 1, data);
        }
    }

    $scope.addNewZipCode = function() {
        if (!$scope.table.beforeSafe) { 
            return;
        }

        $scope.table.error = '';
        $scope.table.success = '';
        $rootScope.$emit('startSpin');
        var params = {
            data: $scope.table.beforeSafe
        };
        var zipCodesAdd = [];
        var zipCodesDelete = [];

        params.data.forEach(function(val, idx) {
            if (val.price === "") {
                zipCodesDelete.push(val.zipCode);
            } else {
                zipCodesAdd.push(val.zipCode);
            }
        });


        var urlToDelete = config.url + 'fleet/' + $scope.fleetOnModal.FleetManagerID + '/zipcodes';
        var paramToDelete = {zipCodes: zipCodesDelete};
        $http({
            method: 'DELETE',
            url: urlToDelete,
            data: paramToDelete,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        });

        Services2.setFleetZipCodes({
            fleetID: $scope.fleetOnModal.FleetManagerID
        }, {zipCodes: zipCodesAdd});

        Services2.bulkSetFleetPrices({
            fleetID: $scope.fleetOnModal.FleetManagerID
        }, params).$promise.then(function (result) {
            $rootScope.$emit('stopSpin');
            getFleetZipCodesOnModal($scope.fleetOnModal.FleetManagerID);
            $scope.table.beforeSafe = [];
            $scope.table.success = result.data.message;
        })
        .catch(function (error) {
            $scope.table.error = error.data.error.message;
            $rootScope.$emit('stopSpin');
        });
    }

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
        getFleets().then(getFleetZipCodes);
    };

    /**
     * Load manage page (add/update page)
     * 
     * @return {void}
     */
    $scope.loadManagePage = function() {
        if ($state.current.name === 'app.update-fleet') {
            getFleetDetails();
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
