'use strict';

angular.module('adminApp')
    .controller('EcommercePricingCtrl', 
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

    $scope.ctrl = {};

    $scope.ctrl.pickup = {
        'key': 'Same Day',
        'value': 1
    };

    $scope.ctrl.webstore = {
        key: 'Master',
        value: 0
    };


    $scope.webstores = [$scope.ctrl.webstore];

    $scope.percentage = {};
    $scope.defaultPrices = {};
    $scope.pickupTypes = [];
    $scope.vehicleTypes = [];

    $scope.states = [];
    $scope.cities = [];

    $scope.gridOptions = {
        flatEntityAccess: true,
        enableCellEditOnFocus: true
    };

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        return $q(function (resolve) {
            $http.get('config/defaultValues.json').success(function(data) {
                $scope.defaultPrices = data.defaultPrices;
                $scope.pickupTypes = data.pickupTypes;
                $scope.ctrl.pickupTypes = $scope.pickupTypes[0];
                $scope.weight = data.weight;
                $scope.ctrl.weight = $scope.weight[0];
                $scope.discount = data.discount;
                $scope.ctrl.discount = $scope.discount[0];
                $scope.countryID = data.country.id;
                resolve();
            });
        });
    };   

    /**
     * Assign pickup type to the chosen item
     * 
     * @return {void}
     */
    $scope.choosePickup = function() {
        if (!$stateParams.query) {
            getPrices();
        }
    };

    /**
     * Change prices based on webstore
     * 
     */
    $scope.chooseWebstore = function() {
        if (!$stateParams.query) {
            getPrices();
        }
    };

    /**
     * Change prices based on vehicle
     * 
     */
    $scope.chooseVehicle = function () {
        if (!$stateParams.query) {
            getPrices();
        }
    };

    /**
     * Change prices based on weight
     * 
     */
    $scope.chooseWeight = function () {
        if (!$stateParams.query) {
            getPrices();
        }
    };

    /**
     * Change prices based on discount
     * 
     */
    $scope.chooseDiscount = function () {
        if (!$stateParams.query) {
            getPrices();
        }
    };

    /**
     * Get all webstores
     * 
     * @return {void}
     */
    var getWebstores = function() {
        return $q(function (resolve) {
            Services.showWebstores().$promise.then(function(data) {
                data.webstores.forEach(function(webstores) {
                    $scope.webstores.push({key: webstores.FirstName.concat(' ', webstores.LastName), value: webstores.UserID});
                });
                resolve();
            });
        });
    };

    /**
     * Get all vehicle
     * @return {[type]} [description]
     */
    var getVehicles = function () {
        return $q(function (resolve) {
            Services.getVehicles().$promise.then(function (data) {
                console.log(data);
                $scope.vehicleTypes = $scope.vehicleTypes.concat(data.vehicles);
                $scope.ctrl.vehicle = $scope.vehicleTypes[0];
                resolve();
            });
        });
    };

    /**
     * Get every city from this country (configure it in defaultValues)
     * @return {[type]} [description]
     */
    var getPlaces = function () {
        return $q(function (resolve) {
            var params = {
                CountryID: $scope.countryID
            };
            Services.getCountryStates(params).$promise.then(function (data) {
                console.log('states', data.states);
                $scope.states = data.states;
                data.states.forEach(function (state) {
                    if (state.Cities) {
                        state.Cities.forEach(function (city) {
                            $scope.cities.push(city);
                        });
                    }
                });
                $scope.originList = $scope.cities;
                $scope.destList = $scope.cities;
                resolve();
            });
        });
    };

    /**
     * Get all webstore prices
     * 
     * @return {void}
     */
    var getPrices = function() {
        $rootScope.$emit('startSpin');
        var params = {
            WebstoreUserID: $scope.ctrl.webstore.value,
            PickupType: $scope.ctrl.pickup.value,
            VehicleID: $scope.ctrl.vehicle.VehicleID,
            MaxWeight: $scope.ctrl.weight.value,
            DiscountID: $scope.ctrl.discount.id
        };
        var paramsMaster = {
            WebstoreUserID: 0,
            PickupType: $scope.ctrl.pickup.value,
            VehicleID: $scope.ctrl.vehicle.VehicleID,
            MaxWeight: $scope.ctrl.weight.value,
            DiscountID: $scope.ctrl.discount.id
        };
        // Get Master price
        Services.getEcommercePrice(paramsMaster).$promise.then(function (data) {
            console.log('master prices', data.prices);
            $scope.masterPrices = data.prices;
            if ($scope.ctrl.webstore.value === 0) {
                buildDefault();
                $rootScope.$emit('stopSpin');
            } else {
                // Get webstore price
                Services.getEcommercePrice(params).$promise.then(function (data) {
                    console.log('webstore prices', data.prices);
                    $scope.prices = data.prices;
                    buildDefault();
                    buildMatrix();
                    $rootScope.$emit('stopSpin');
                });
            }
            
        });
    };

    /**
     * Save changed / added price
     * @param  {number} originID - id of origin city
     * @param  {number} destID   - id of destination city
     * @param  {number} price    - new price value
     * 
     */
    var savePrice = function(originID, destID, price) {
        $rootScope.$emit('startSpin');
        var params = {
            WebstoreUserID: $scope.ctrl.webstore.value,
            PickupType: $scope.ctrl.pickup.value,
            VehicleID: $scope.ctrl.vehicle.VehicleID,
            MaxWeight: $scope.ctrl.weight.value,
            DiscountID: $scope.ctrl.discount.id,
            OriginID: originID,
            DestinationID: destID,
            Price: price
        };
        Services.addEcommercePrice(params).$promise.then(function (result) {
            console.log(result);
            $rootScope.$emit('stopSpin');
            getPrices();
        })
        .catch(function (error) {
            alert('Error: ' + error);
            $rootScope.$emit('stopSpin');
        });
    };

    /**
     * Build / define column definition for ui.grid table
     * 
     */
    var buildColumnDefs = function () {
        var defs = [
            {name: 'id', enableCellEdit: false, width: '4%', pinnedLeft: true, visible: false},
            {name: 'origin', enableCellEdit: false, width: '13%', pinnedLeft: true, cellClass: 'text-left'},
        ];
        $scope.cities.forEach(function (city) {
            defs.push({
                name: city.CityID.toString(),
                displayName: city.Name,
                width: '7%',
                enableColumnMenu: false,
                enableSorting: false,
                cellClass: 'text-center',
                cellTemplate: 
                    '<div class="ui-grid-cell-contents" title="TOOLTIP">' +
                        '<div ng-if="COL_FIELD CUSTOM_FILTERS.source === ' + "'webstore'" + '">' +
                            '{{COL_FIELD CUSTOM_FILTERS.price}}' + '</div>' +
                        '<div class="red" ng-if="COL_FIELD CUSTOM_FILTERS.source === ' + "'master'" + '">' +
                            '{{COL_FIELD CUSTOM_FILTERS.price}}' + '</div>' +
                    '</div>',
                editableCellTemplate: 
                    '<div>' +
                      '<form name="inputForm">' +
                        '<input  type="INPUT_TYPE" ng-class="' + "'colt'" + ' + col.uid" ui-grid-editor ' +
                                'ng-model="MODEL_COL_FIELD.price"/>' +
                      '</form>' +
                    '</div>'
            });
        });
        $scope.gridOptions.columnDefs = defs;
    };
    
    /**
     * Build default data array,
     * all price is assigned to 0
     * 
     */
    var buildDefault = function () {
        $scope.gridOptions.data = [];
        $scope.cities.forEach(function (origin) {
            var rowContent = {};
            rowContent.id = origin.CityID;
            rowContent.origin = origin.Name;
            $scope.cities.forEach(function (dest) {
                var price = lodash.find($scope.masterPrices, {
                    'OriginID': origin.CityID, 'DestinationID': dest.CityID});
                if (price) {
                    rowContent[dest.CityID] = {
                        source: 'master',
                        price: price.Price,
                        old: price.Price
                    };
                }
            });
            $scope.gridOptions.data.push(rowContent);
        });
    };

    /**
     * Build matrix array from price database
     * 
     */
    var buildMatrix = function () {
        $scope.cities.forEach(function (origin, i) {
            $scope.cities.forEach(function (dest) {
                var price = lodash.find($scope.prices, {
                    'OriginID': origin.CityID, 'DestinationID': dest.CityID});
                if (price) {
                    $scope.gridOptions.data[i][dest.CityID] = {
                        source: 'webstore',
                        price: price.Price,
                        old: price.Price
                    };
                }
            });
        });
    };

    /**
     * Function that run after a cell is edited
     * @param  {[type]} gridApi - gridApi from ui.grid
     * 
     */
    $scope.gridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
            // Because of templating in ui.grid.edit, oldValue is not working as it used to be
            if (newValue) {
                if (newValue.price !== newValue.old) {
                    console.log('newValue:' + newValue.price + ' oldValue:' + newValue.old);
                    // If new value is a valid number
                    var price = parseInt(newValue.price);
                    if (price) {
                        savePrice(rowEntity.id, colDef.name, price);
                    } else {
                        alert('Empty or contains non number character');
                        getPrices();
                    }
                }
            }
        });
    };

    $rootScope.$emit('startSpin');
    getDefaultValues().then(
    getWebstores().then(
    getVehicles().then(function(){
        getPlaces().then(function(){
            buildColumnDefs();
            getPrices();
        });
    })
    ));

});
