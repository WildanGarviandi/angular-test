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
            SweetAlert,
            $timeout
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.fleet = [];
    $scope.fleetOnModal = [];
    var paramsAfterChange = [];
    
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

    /**
     * Get all fleets
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
        var params = {};
        params.fleetManagerID = fleetManagerID;
        params.limit = 1;
        Services2.getFleetZipCodes(params).$promise.then(function(data) {
            params.limit = data.data.count;
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
            if(val.zipCode == data.zipCode){
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

    /**
     * Delete ZipCode 
     * @param  {Array} zipCodes
     *
     */
    function deleteZipCodes(fleetID, zipCodes) {
        var urlToDelete = config.url + 'fleet/' + fleetID + '/zipcodes';
        $http({
            method: 'DELETE',
            url: urlToDelete,
            data: {zipCodes: zipCodes},
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).then(function (result) {
            ngDialog.closeAll();
            $state.reload();
        });
    };
    
    /**
     * Select all or unselect all fleets zipcode.
     * 
     * @return {void}
     */
    $scope.checkUncheckSelected = function() {
        $scope.displayed.forEach(function(fleet) {
            fleet.Selected = $scope.status.selectedAll;
        });
        $scope.prepareSelectedFleets();
    };

    /**
     * Check whether there is one or more fleets zipcode selected.
     * 
     * @return {boolean}
     */
    $scope.selectedFleetExists = function() {
        var checked = false;
        $scope.displayed.some(function(fleet) {
            if (fleet.Selected) {
                checked = true;
                return;
            }
        });
 
        return checked;
    };
 
    /**
     * Prepare selected fleet zipcode.
     * 
     * @return {array}
     */
    $scope.prepareSelectedFleets = function() {            
        var selectedFleets = [];
        $scope.displayed.forEach(function (order) {
            if (order.Selected) {
                selectedFleets.push(order);
            }
        });
 
        $scope.selectedFleets = selectedFleets;

        $scope.isFleetSelected = false;
        if ($scope.selectedFleetExists()) {
            $scope.isFleetSelected = true;
        }
    };

    $scope.deleteZipCode = function(fleet) {
        var zipCode = [],
            fleetName = (fleet.FleetManager && fleet.FleetManager.CompanyDetail) ? fleet.FleetManager.CompanyDetail.CompanyName : '-',
            fleetID = fleet.FleetManagerID,
            price = (fleet.FleetPrice) ? fleet.FleetPrice.Price : 0;
            zipCode.push(fleet.ZipCode);
        
        var text = "<br><br>" + 'Vendor: '+ fleetName + '<br>' + 'Zip Code: ' + zipCode;

        if (fleet === 'bulk') {
            var listDelete = [];
            var fleetID = [];
            $scope.selectedFleets.forEach(function(fleet) {
                var CompanyName = (fleet.FleetManager && fleet.FleetManager.CompanyDetail) ? fleet.FleetManager.CompanyDetail.CompanyName : '-';
                if (typeof fleetID[fleet.FleetManagerID] === 'undefined') {
                    fleetID[fleet.FleetManagerID] = [];
                }

                fleetID[fleet.FleetManagerID].push(fleet.ZipCode);
                listDelete.push(CompanyName + ': ' + fleet.ZipCode);
            });
            text = "<br><br>" + '[' + listDelete.join("] [") + ']';
        }

        SweetAlert.swal({
            title: "Warning",
            text: "Are you sure want to delete this zipcode coverage from this vendor?" + text,
            type: "warning",
            html: true,
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Remove",
        }, function (isConfirm) { 
            if (isConfirm) {
                if (fleetID.length > 0) {
                    fleetID.forEach(function(zipCode, id) {
                        deleteZipCodes(id, zipCode);
                    });
                } else {
                    deleteZipCodes(fleetID, zipCode);
                }
            }
        });
    }

    /**
     * Add, Edit and Delete for zipcode or price. all changed Cell to Server
     * 
     */
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

});
