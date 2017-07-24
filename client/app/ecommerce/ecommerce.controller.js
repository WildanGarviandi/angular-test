'use strict';

angular.module('adminApp')
    .controller('EcommercePricingCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope,
            Webstores, 
            Services,
            Services2,
            moment, 
            lodash, 
            $state, 
            $stateParams, 
            $location, 
            $http, 
            $window,
            $filter,
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

    $scope.input.pricingType = 1;

    $scope.percentage = {};
    $scope.defaultPrices = {};
    $scope.pickupTypes = [];

    $scope.states = [];
    $scope.cities = [];
    
    $scope.table = {};
    $scope.table.colHeaders = true;
    $scope.table.beforeSafe = [];
    $scope.table.error = '';
    $scope.table.success = '';

    var getTabs = function(pricingType, title, type, choose, init, arrayList) {
        $scope.tabs.push({ 
            title: title, 
            type: type,
            choose: choose,
            model: init,
            models: arrayList,
            pricingType: pricingType
        });
    };

    $scope.createTab = function(pricingType) {
        if(pricingType == 1) {
            getTabs(pricingType, 'By Weight', 'Weight', $scope.chooseWeight, $scope.input.weight, $scope.weight);
        }
        if (pricingType == 2) {
            getTabs(pricingType, 'By Package Size', 'Package Size', $scope.choosePackageSize, $scope.input.packageSize, $scope.packageSize);
        }
    }

    $scope.chooseTab = function(pricingType){
        $scope.input.pricingType = pricingType;
        getPrices();
    };

    $scope.filter = 'price';

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        return $q(function (resolve) {
            $http.get('config/defaultValues.json').success(function(data) {
                $scope.defaultPrices = data.defaultPrices;
                $scope.pickupTypes = _.filter(data.pickupTypes, function(pickupType) {
                    return pickupType.value !== 3;
                });
                $scope.input.pickupTypes = $scope.pickupTypes[0];
                $scope.packageSize = data.packageSize;
                $scope.input.packageSize = $scope.packageSize[0];
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
        'Weight': {
            model: 'weight',
            pick: 'value',
            collection: 'weight'
        },
        'PackageSize': {
            model: 'packageSize',
            pick: 'value',
            collection: 'packageSize'
        },
    };

    lodash.each(pickedVariables, function (val, key) {
        /**
         * Assign url param when choosing an option
         * Generates:
         * choosePickup, chooseWebstore, chooseWeight, choosePackage
         * 
         * @return {void}
         */
        $scope['choose' + key] = function (item) {
            $location.search(val.model, item[val.pick]);
            if (key === 'Webstore') {
                getWebstoreDetail(item[val.pick]);
            } else {
                getPrices();
            }
        };
    });

    /**
     * Get all webstores
     * 
     * @return {void}
     */
    var getWebstores = function() {
        return $q(function (resolve) {
            var params = {};
                params.status = 2;

            Services2.getWebstores(params).$promise.then(function (result) {
                result.data.webstores.forEach(function(v) {
                    $scope.webstores.push({key: v.webstore.FirstName.concat(' ', v.webstore.LastName), value: v.webstore.UserID});
                });
                resolve();
            });
        });
    };

    /**
     * Get webstore detail
     * 
     * @return {void}
     */
    var getWebstoreDetail = function(webstoreID) {
        return $q(function (resolve) {
            if (!webstoreID) {
                $scope.input.webstore = $scope.webstores[0];
                getPrices();
                return resolve();
            };

            Webstores.getWebstoreDetails({
                id: webstoreID,
            }).$promise.then(function(result) {
                $scope.input.webstore = {key: result.data.User.FirstName.concat(' ', result.data.User.LastName), value: result.data.User.UserID};
                $scope.input.pricingType = result.data.User.WebstoreCompany.PricingType;
                getPrices();
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
        $scope.tabs = [];

        lodash.each(pickedVariables, function (val) {
            var value = $location.search()[val.model] || $scope.input[val.model][val.pick];
            var findObject = {};
            findObject[val.pick] = (parseInt(value)) ? parseInt(value) : value;
            $scope.input[val.model] = lodash.find($scope[val.collection], findObject);
        });

        if (!$scope.input.webstore || !$scope.input.webstore.value) {
            $scope.input.webstore = $scope.webstores[0];
            $scope.createTab(1);
            $scope.createTab(2);
        } else {
            $scope.createTab($scope.input.pricingType);
        }

        lodash.each($scope.tabs, function (val, key) {
            if (val.pricingType === $scope.input.pricingType) {
                $scope.tabs[key].active = true;
            }
        });

        var params = {
            merchantID: $scope.input.webstore.value,
            pricingType: $scope.input.pricingType,
            pickupType: $scope.input.pickup.value,
            maxWeight: $scope.input.weight.value,
            packageDimensionID: $scope.input.packageSize.value
        };
        var paramsMaster = {
            merchantID: 0,
            pricingType: $scope.input.pricingType,
            pickupType: $scope.input.pickup.value,
            maxWeight: $scope.input.weight.value,
            packageDimensionID: $scope.input.packageSize.value
        };
        // Get Master price
        Services2.getEcommercePrices(paramsMaster).$promise.then(function (result) {
            $scope.masterPrices = lodash.filter(result.data.data, {WebStore: {UserID: '0'}});
            if ($scope.input.webstore.value === 0) {
                buildDefault();
                $rootScope.$emit('stopSpin');
            } else {
                // Get webstore price
                Services2.getEcommercePrices(params).$promise.then(function (result) {
                    $scope.prices = result.data.data;
                    buildDefault();
                    buildMatrix();
                    $rootScope.$emit('stopSpin');
                });
            }
            
        });
    };

    /**
     * Save changed / added price
     * 
     */
    $scope.savePrice = function() {
        if (!$scope.table.beforeSafe) { 
            return;
        }

        $scope.table.error = '';
        $scope.table.success = '';
        $rootScope.$emit('startSpin');
        var params = {
            pricingType: $scope.input.pricingType,
            pickupType: $scope.input.pickup.value,
            maxWeight: $scope.input.weight.value,
            packageDimensionID: $scope.input.packageSize.value,
            prices: $scope.table.beforeSafe
        };

        Services2.saveEcommercePrice({
            merchantID: $scope.input.webstore.value
        }, params).$promise.then(function (result) {
            $rootScope.$emit('stopSpin');
            getPrices();
            $scope.table.beforeSafe = [];
            $scope.table.success = result.data.message;
            if ($scope.table.startEdit) {
                clearInterval($scope.table.startEdit);
            }
        })
        .catch(function (error) {
            $scope.table.error = error.data.error.message;
            $rootScope.$emit('stopSpin');
        });
    };

    var deletePrice = function (originID, destID) {
        $rootScope.$emit('startSpin');
        var params = {
            webstoreUserID: $scope.input.webstore.value,
            pickupType: $scope.input.pickup.value,
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
        var colHeaders = ['Origin'];
        var rowHeaders = [];
        $scope.cities.forEach(function (city) {
            colHeaders.push(city.Name);
            rowHeaders.push(city.Name);
        });
        $scope.table.colHeaders = colHeaders;
        $scope.table.rowHeaders = rowHeaders;
    };
    
    var priceRenderer = function(hotInstance, td, row, col, prop, value, cellProperties) {
        if (value && typeof value === 'string') {
            if (value.indexOf(' ') !== -1) {
                value = value.replace(' ', '');
                td.className = 'red';
            }
        }

        value = $filter('localizenumber')($filter('number')(value));
        td.innerHTML = value;
    }

    /**
     * Build default data array,
     * all price is assigned to 0
     * 
     */
    var buildDefault = function () {
        var columns = {};
        $scope.table.data = [];
        $scope.table.columns = [{
            data: 0,
            title: 'Origin',
            readOnly: true
        }];
        var i = 0;
        $scope.cities.forEach(function (origin) {
            var rowContents = {};
            rowContents[0] = origin.Name;
            $scope.cities.forEach(function (dest, key) {
                var data = lodash.find($scope.masterPrices, {
                    Origin: {ID: origin.CityID}, Destination: {ID: dest.CityID}});
                var price = 0;
                if (data) {
                    if ($scope.filter === 'price') {
                        price = data.Price;
                    } else {
                        price = data.AdditionalPrice;
                    }
                    rowContents[dest.CityID] = price + ' ';
                } else {
                    rowContents[dest.CityID] = '';
                }
                if (i === 0) {
                    columns = {
                        data: dest.CityID,
                        title: dest.Name,
                        renderer: priceRenderer
                    };
                    $scope.table.columns.push(columns);
                }
                
            });
            $scope.table.data.push(rowContents);
            i++;
        });
    };

    /**
     * Build matrix array from price database
     * 
     */
    var buildMatrix = function () {
        $scope.cities.forEach(function (origin, i) {
            $scope.cities.forEach(function (dest, key) {
                var data = lodash.find($scope.prices, {
                    Origin: {ID: origin.CityID}, Destination: {ID: dest.CityID}});
                var price = 0;
                if (data) {
                    if ($scope.filter === 'price') {
                        price = data.Price;
                    } else {
                        price = data.AdditionalPrice;
                    }
                    $scope.table.data[i][dest.CityID] = price;
                }
            });
        });
    };

    /**
     * Do function before cell changed
     * Check initial state is integer or not
     */
    $scope.beforeChange = function (changes, source) {
        $.each(changes, function (index, element) {
            var change = element;
            if (!parseInt(change[3])) {
                return changes[index][3] = change[3].replace(/<(?:.|\n)*?>/gm, '');
            } else {
                return false;
            }
        });
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

            var params = {
                originID: $scope.table.columns[change[0] + 1].data,
                destinationID: change[1],
                price: change[3]
            };

            return collectDataBeforeSafe(params);
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
            if(val.destinationID == data.destinationID && val.originID == data.originID){
                indexKey = key;
                return true;
            }; 
        });

        if (!isDataExist) {
            $scope.table.beforeSafe.push(data);
        } else {
            $scope.table.beforeSafe.splice(indexKey, 1, data);
        }

        if (!$scope.table.startEdit) {
            $scope.table.startEdit = startTimer();
        } else {
            clearInterval($scope.table.startEdit);
            $scope.table.startEdit = startTimer();
        }
    }

    /**
     * Push Data to server by time interval
     * set every 2 minutes while idle and has not pushed to server
     */
    function startTimer(){
        var interval = 1;
        var timerID = -1; //hold the id
        var duration = moment.duration({
            'hour': 0,
            'minutes': 2,
            'seconds': 0 
        });

        var timer = setInterval(function () {
            if (duration.asSeconds() <= 0) {
                clearInterval(timerID);
                $scope.table.startEdit = 0;
                $scope.savePrice();
            } else {
                duration = moment.duration(duration.asSeconds() - interval, 'seconds');
            }
        }, 1000);

        timerID = timer;

        return timer;
    };

    $scope.filterTab = function (value) {
        $scope.filter = value;
        buildDefault();
        buildMatrix();
    };

    $rootScope.$emit('startSpin');
    getDefaultValues()
    .then(getWebstores)
    .then(getPlaces)
    .then(function () {
        buildColumnDefs();
        getPrices();
    });

});
