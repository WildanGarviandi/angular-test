'use strict';

angular.module('adminApp')
    .controller('EcommercePricingCtrl', 
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
            $q
    ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.input = {};

    $scope.input.pickup = {
        'key': 'Same Day',
        'value': 1
    };

    $scope.input.webstore = {
        key: 'Master',
        value: 0
    };

    $scope.webstores = [$scope.input.webstore];

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

    $scope.tabs = [
        { heading: 'Price / selected weight', value: 'price' },
        {   
            heading: 'Additional Price / kg', 
            value: 'additional',
            tooltip: 'Additional price is applied when package is heavier than available weight'
        }
    ];

    $scope.$watch(function () {
        return $scope.input.weight;
    }, function (weight) {
        if (weight && weight.value !== $scope.maxWeight) {
            $scope.tabs[1].hide = true;
            $scope.tabs[0].active = true;
        } else {
            $scope.tabs[1].hide = false;
        }   
    });

    $scope.filter = 'price';

    $scope.blankCounter = 0;

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
                $scope.input.pickupTypes = $scope.pickupTypes[0];
                $scope.weight = data.weight;
                $scope.maxWeight = Math.max.apply(Math, $scope.weight.map(function(o){return o.value;}));
                $scope.input.weight = $scope.weight[0];
                $scope.discount = data.discount;
                $scope.input.discount = $scope.discount[0];
                $scope.countryID = data.country.id;
                resolve();
            });
        });
    };

    var pickedVariables = {
        'Pickup': {
            model: 'pickup',
            pick: 'value',
            collection: 'pickupTypes'
        },
        'Webstore': {
            model: 'webstore',
            pick: 'value',
            collection: 'webstores'
        },
        'Vehicle': {
            model: 'vehicle',
            pick: 'VehicleID',
            collection: 'vehicleTypes'
        },
        'Weight': {
            model: 'weight',
            pick: 'value',
            collection: 'weight'
        },
        'Discount': {
            model: 'discount',
            pick: 'id',
            collection: 'discount'
        },
    };

    lodash.each(pickedVariables, function (val, key) {
        /**
         * Assign url param when choosing an option
         * Generates:
         * choosePickup, chooseWebstore, chooseVehicle, chooseWeight, chooseDiscount
         * 
         * @return {void}
         */
        $scope['choose' + key] = function (item) {
            $location.search(val.model, item[val.pick]);
            getPrices();
        };
    });

    /**
     * Get all webstores
     * 
     * @return {void}
     */
    var getWebstores = function() {
        return $q(function (resolve) {
            Services2.getWebstores().$promise.then(function(result) {
                result.data.webstores.forEach(function(v) {
                    $scope.webstores.push({key: v.webstore.FirstName.concat(' ', v.webstore.LastName), value: v.webstore.UserID});
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
            Services2.getVehicles().$promise.then(function (result) {
                $scope.vehicleTypes = $scope.vehicleTypes.concat(result.data.Vehicles);
                $scope.input.vehicle = $scope.vehicleTypes[0];
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
                status: true,
                limit: 1000
            };
            Services2.getCities(params).$promise.then(function (result) {
                $scope.cities = result.data.Cities.rows;
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

        lodash.each(pickedVariables, function (val) {
            var value = $location.search()[val.model] || $scope.input[val.model][val.pick];
            var findObject = {};
            findObject[val.pick] = (parseInt(value)) ? parseInt(value) : value;
            $scope.input[val.model] = lodash.find($scope[val.collection], findObject);
        });

        var params = {
            webstoreUserID: $scope.input.webstore.value,
            pickupType: $scope.input.pickup.value,
            vehicleID: $scope.input.vehicle.VehicleID,
            maxWeight: $scope.input.weight.value,
            discountID: $scope.input.discount.id
        };
        var paramsMaster = {
            webstoreUserID: 0,
            pickupType: $scope.input.pickup.value,
            vehicleID: $scope.input.vehicle.VehicleID,
            maxWeight: $scope.input.weight.value,
            discountID: $scope.input.discount.id
        };
        // Get Master price
        Services2.getEcommercePrices(paramsMaster).$promise.then(function (result) {
            $scope.masterPrices = result.data.Prices;
            if ($scope.input.webstore.value === 0) {
                buildDefault();
                $rootScope.$emit('stopSpin');
            } else {
                // Get webstore price
                Services2.getEcommercePrices(params).$promise.then(function (result) {
                    $scope.prices = result.data.Prices;
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
    var savePrice = function(originID, destID, price, additional) {
        $rootScope.$emit('startSpin');
        var params = {
            webstoreUserID: $scope.input.webstore.value,
            pickupType: $scope.input.pickup.value,
            vehicleID: $scope.input.vehicle.VehicleID,
            maxWeight: $scope.input.weight.value,
            discountID: $scope.input.discount.id,
            originID: originID,
            destinationID: destID,
        };
        if (price) { params.price = price; }
        if (additional) { params.additionalPrice = additional; }
        Services2.saveEcommercePrice(params).$promise.then(function (result) {
            $rootScope.$emit('stopSpin');
            getPrices();
        })
        .catch(function (error) {
            alert('Error: ' + error);
            $rootScope.$emit('stopSpin');
        });
    };

    var deletePrice = function (originID, destID) {
        $rootScope.$emit('startSpin');
        var params = {
            webstoreUserID: $scope.input.webstore.value,
            pickupType: $scope.input.pickup.value,
            vehicleID: $scope.input.vehicle.VehicleID,
            maxWeight: $scope.input.weight.value,
            discountID: $scope.input.discount.id,
            originID: originID,
            destinationID: destID
        };
        Services2.deleteEcommercePrice(params).$promise.then(function (result) {
            $rootScope.$emit('stopSpin');
            getPrices();
        })
        .catch(function (error) {
            alert('Error: ' + error);
            $rootScope.$emit('stopSpin');
        });
    }

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
                    '<div class="ui-grid-cell-contents blank" title="TOOLTIP" ' +
                        'ng-if="COL_FIELD CUSTOM_FILTERS.source === ' + "'nosource'" + '">' +
                    '</div>' +
                    '<div class="ui-grid-cell-contents" title="TOOLTIP" ' +
                        'ng-if="COL_FIELD CUSTOM_FILTERS.source !== ' + "'nosource'" + '">' +
                        '<div ng-if="COL_FIELD CUSTOM_FILTERS.source === ' + "'webstore'" + '">' +
                            '{{COL_FIELD CUSTOM_FILTERS.price}}' + '</div>' +
                        '<div class="red" ng-if="COL_FIELD CUSTOM_FILTERS.source === ' + "'master'" + '">' +
                            '{{COL_FIELD CUSTOM_FILTERS.price}}' + '</div>' +
                    '</div>',
                editableCellTemplate: 
                    '<div>' +
                      '<form name="inputForm">' +
                        '<input  type="number" ng-class="' + "'colt'" + ' + col.uid" ui-grid-editor ' +
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
        $scope.blankCounter = 0;
        $scope.cities.forEach(function (origin) {
            var rowContent = {};
            rowContent.id = origin.CityID;
            rowContent.origin = origin.Name;
            $scope.cities.forEach(function (dest) {
                var data = lodash.find($scope.masterPrices, {
                    Origin: {CityID: origin.CityID}, Destination: {CityID: dest.CityID}});
                var price = 0;
                if (data) {
                    if ($scope.filter === 'price') {
                        price = data.Price;
                    } else {
                        price = data.AdditionalPrice;
                    }
                    rowContent[dest.CityID] = {
                        source: 'master',
                        price: price,
                        old: price
                    };
                } else {
                    rowContent[dest.CityID] = {
                        source: 'nosource',
                        price: '',
                        old: ''
                    };
                    $scope.blankCounter++;
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
                var data = lodash.find($scope.prices, {
                    Origin: {CityID: origin.CityID}, Destination: {CityID: dest.CityID}});
                var price = 0;
                if (data) {
                    if ($scope.filter === 'price') {
                        price = data.Price;
                    } else {
                        price = data.AdditionalPrice;
                    }
                    $scope.gridOptions.data[i][dest.CityID] = {
                        source: 'webstore',
                        price: price,
                        old: price
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
                    // If new value is a valid number
                    var price = parseInt(newValue.price);
                    if (price) {
                        if ($scope.filter === 'price') {
                            savePrice(rowEntity.id, colDef.name, price, null);
                        } else {
                            savePrice(rowEntity.id, colDef.name, null, price);
                        }
                    } else {
                        if ($scope.input.webstore.value !== 0) {
                            // if not a master, then delete the price
                            deletePrice(rowEntity.id, colDef.name);
                        } else {
                            // if master
                            alert('Empty or contains non number character');
                            getPrices();
                        }
                    }
                }
            } 
        });
    };

    $scope.filterTab = function (value) {
        $scope.filter = value;
        buildDefault();
        buildMatrix();
    };

    $rootScope.$emit('startSpin');
    getDefaultValues()
    .then(getWebstores)
    .then(getVehicles)
    .then(getPlaces)
    .then(function () {
        buildColumnDefs();
        getPrices();
    });

});
