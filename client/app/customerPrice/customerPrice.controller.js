'use strict';

angular.module('adminApp')
    .controller('CustomerPriceCtrl', 
        function(
            $q,
            $scope, 
            $rootScope,
            $filter,
            $state,
            $location, 
            $window,
            $http, 
            $httpParamSerializer,
            Auth,  
            Services, 
            Services2,
            Webstores,
            moment, 
            lodash, 
            config,
            SweetAlert,
            ngDialog
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.itemsByPage = $location.search().limit || 50;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.isTableDisplayed = true;
    $scope.limitPages = [$scope.itemsByPage, 10, 25, 50, 100, 200];
    $scope.currency = config.currency;

    $scope.handsontable = {};
    $scope.table = {};
    $scope.table.colHeaders = true;
    $scope.table.beforeSafe = [];
    $scope.table.error = '';
    $scope.table.success = '';

    // Here, model and param have same naming format
    var pickedVariables = {
            'Merchant': {
                model: 'merchant',
                pick: 'value',
            },
            'PickupType': {
                model: 'pickupType',
                pick: 'value'
            },
            'Port': {
                model: 'port',
                pick: 'value'
            }
        };

    // Generates
    // chooseMerchant, choosePickupType, choosePort
    lodash.each(pickedVariables, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
        };
    });
    
    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {
        $scope.tableState = state;
        if ($scope.isFirstLoaded) {
            $scope.tableState.pagination.start = $scope.offset;
            $scope.isTableDisplayedFirstLoad = true;
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        initFunction();
    }

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        return $q(function (resolve) {
            $http.get('config/defaultValues.json').success(function(data) {
                $scope.pickupTypes = [{
                    key: 'Service Type',
                    value: '0'
                }];
                data.pickupTypes.forEach(function (pickupType) {
                    if (pickupType.value === 2 || pickupType.value === 4) {
                        $scope.pickupTypes.push(pickupType);
                    };
                });
                $scope.pickupType = $scope.pickupTypes[0];
                resolve();
            });
        });
    }

    /**
     * Get All TLC (ports)
     * 
     * @return {void}
     */
    var getPorts = function() {
        return Services2.getPorts().$promise.then(function (data) {
            $scope.ports = [{
                key: 'Origin TLC',
                value: '0'
            }];
            data.data.forEach(function(port) {
                $scope.ports.push({
                    key: port.ThreeLetterCode, 
                    value: port.PortID
                });
                $scope.port = $scope.ports[0];
            });
        });
    }

    /**
     * Get merchant selection
     * 
     * @return {void}
     */
    var getMerchants = function() {
        var params = {};
            params.status = 2;

        return Webstores.getWebstore(params).$promise.then(function (data) {
            $scope.merchants = [{
                key: 'Choose Merchant',
                value: '0'
            }];
            data.data.webstores.forEach(function(merchant) {
                $scope.merchants.push({
                    key: merchant.webstore.FirstName + ' ' + merchant.webstore.LastName, 
                    value: merchant.webstore.UserID
                });
                $scope.merchant = $scope.merchants[0];
            });
        });
    }

    var getCurrentParam = function () {
        var params = {};
        var paramsValue = {};
            paramsValue.merchant = 'merchants';
            paramsValue.pickupType = 'pickupTypes';
            paramsValue.port = 'ports';

        lodash.each(paramsValue, function (val, key) {
            var value = $location.search()[key] || $scope[key].value;
            $scope[key] = lodash.find($scope[val], { 'value': (parseInt(value)) ? parseInt(value) : value });
        });

        params.merchantID = $scope.merchant.value;
        params.pickupType = $scope.pickupType.value;
        params.originID = $scope.port.value;

        return params;
    }

    /**
     * Load initial function
     * @return void
     */
    var initFunction = function () {
        $rootScope.$emit('startSpin');

        getDefaultValues()
        .then(getMerchants)
        .then(getPorts)
        .then(function () {
            var params = getCurrentParam();
            if (params.merchantID != 0 && params.pickupType != 0 && params.originID) {
                $scope.getCustomerPrice();
            }
        })

        if ($scope.isTableDisplayedFirstLoad) {
            $scope.isTableDisplayed = false;
            $scope.isTableDisplayedFirstLoad = false;
        };

        $rootScope.$emit('stopSpin');
    }

    /**
     * Load initial function
     * @return void
     */
    $scope.initAddPrice = function () {
        return;
    }

    /**
     * Get Customer Price
     * 
     * @return {void}
     */
    $scope.getCustomerPrice = function () {
        $scope.isTableDisplayed = false;
        var params = getCurrentParam();

        return Services2.getEcommercePrices(params).$promise
        .then(function (result) {
            $scope.prices = result.data.data;
            $scope.pricesCount = result.data.count;
            $scope.prices.forEach(function (val, index, array) {
                array[index].DestinationZipCode = (val.Destination && val.Destination.ZipCode) ? parseInt(val.Destination.ZipCode) : '';
            });
            $scope.isTableDisplayed = true;
        })
        .catch(function(error) {
            SweetAlert.swal('Error', error.data.error.message, 'error');
        });
    }

    /**
     * Get Last Customer Price Download
     * 
     * @return {void}
     */
    $scope.getLastDownload = function () {
        var params = getCurrentParam();
            params.originPortID = params.originID;
        
        return Services2.getLatestPriceDownload(params).$promise
        .then(function (result) {
            $scope.lastDownload = result.data;
        })
        .catch(function(error) {
            SweetAlert.swal('Error', error.data.error.message, 'error');
        });
    }

    /**
     * Get Download Customer Price
     * 
     * @return {void}
     */
    $scope.downloadExcel = function () {
        var type = 'price';
        var mandatoryUrl = 'exportType=' + type + '&' + 'maxExport=' + $scope.pricesCount;
        var params = getCurrentParam();
            params.isDownload = true;
            params.userID = $scope.user.UserID;

        $window.open('/export?' + mandatoryUrl + '&' + $httpParamSerializer(params));
        return;
    }

    /**
     * Open modal by templateID and do some action before opening modal 
     * @return void
     */
    $scope.openModal = function(templateID, action, others) {
        var params = {};
            params.template = templateID;
            params.scope = $scope;
            params.className = 'ngdialog-theme-default create-cod-payment-popup';
            params.closeByDocument = false;

        if (others) {
            $scope.onModal = others;
            if (others.width) {
                params.width = others.width;
            }
        }

        $scope.closeModal();
        if (action) {
            action()
            .then(function () {
                ngDialog.open(params);
            });
        } else {
            ngDialog.open(params);
        }
    }

    $scope.handsontable.start = function () {
        $scope.table.data = [[]];
        $scope.table.beforeSafe = [];
        return $q.resolve();
    }

    $scope.handsontable.addNewRow = function () {
        $scope.table.data.push([]);
    }

    $scope.handsontable.removeNewRow = function () {
        $scope.table.data.pop();
    }

    /**
     * Do function after cell changed
     * 
     */
    $scope.handsontable.afterChange = function (changes) {
        if (!changes) {
            return;
        }

        $.each(changes, function (index, element) {
            var change = element;
            var params = {};

            if ($scope.onModal.type == 'create') {
                params.zipCode = $scope.table.data[change[0]]['zipcode'];
                params.price = change[3];
                collectDataBeforeSafe(params);
            }
        });
    }

    /**
     * Collect all changed Cell before push to Server
     * 
     */
    var collectDataBeforeSafe = function (data) {
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
            }
        });

        if (!isDataExist) {
            $scope.table.beforeSafe.push(data);
        } else {
            $scope.table.beforeSafe.splice(indexKey, 1, data);
        }
    }

    /**
     * Do function before cell changed
     * Check initial state is integer or not
     */
    $scope.handsontable.beforeChange = function (changes, source) {
        if (changes.length > 0) {
            var forbid = false;
            var duplicates = [];
            changes.forEach(function (val) {
                if (val[3] && val[1] === 0 && lodash.find($scope.table.data, {0: val[3]})) {
                    duplicates.push(val[3]);
                }
                if (val[3] === '' && val[1] === 0) {
                    forbid = true;
                }
            });
            if (duplicates.length > 0) {
                alert('Duplicates: ' + duplicates.join(', '));
                return false;
            }
            if (forbid) {
                alert('You can only add zipcode, do not change or remove it');
                return false;
            }
        }
        return true;
    }

    /**
     * Add, Edit and Delete for zipcode or price. all changed Cell to Server
     * 
     */
    $scope.addNewZipCode = function() {
        if (!$scope.table.beforeSafe.length) { 
            return SweetAlert.swal('Error', 'please insert zipcode', 'error');
        }

        $rootScope.$emit('startSpin');

        var params = {};
            params.pickupType = $scope.pickupType.value;
            params.prices = [];

        $scope.table.beforeSafe.forEach(function(val, idx) {
            var price = {};
                price.originID = $scope.port.value;
                price.destinationID = val.zipCode;
                price.price = val.price || 0;

            params.prices.push(price);
        });
        
        Services2.saveEcommercePrice({
            merchantID: $scope.merchant.value
        }, params).$promise.then(function (result) {
            $scope.table.success = result.data.message;
            $rootScope.$emit('stopSpin');
            $scope.getCustomerPrice();
            $scope.closeModal();
        })
        .catch(function (error) {
            $scope.table.error = error.data.error.message;
            SweetAlert.swal('Error', error.data.error.message, 'error');
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Delete for zipcode and price. all changed Cell to Server
     * 
     */
    $scope.deleteZipCode = function() {
        if (!$scope.table.data.length) { 
            return SweetAlert.swal('Error', 'please insert zipcode', 'error');
        }

        $rootScope.$emit('startSpin');

        var params = {};
            params.pickupType = $scope.pickupType.value;
            params.prices = [];

        $scope.table.data.forEach(function(val, idx) {
            var price = {};
                price.originID = $scope.port.value;
                price.destinationID = val['zipcode'];
            
            if (val['zipcode'] !== "") {
                params.prices.push(price);
            }
        });
        
        Services2.saveEcommercePrice({
            merchantID: $scope.merchant.value
        }, params).$promise.then(function (result) {
            $scope.table.success = result.data.message;
            $rootScope.$emit('stopSpin');
            $scope.getCustomerPrice();
            $scope.closeModal();
        })
        .catch(function (error) {
            $scope.table.error = error.data.error.message;
            SweetAlert.swal('Error', error.data.error.message, 'error');
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Closed Modal
     * @return void
     */
    $scope.closeModal = function() {
        ngDialog.close();
    }

    /**
     * Set limit page
     * 
     * @return {void}
     */
    $scope.setLimit = function(item) {
        $location.search('limit', item);
        $scope.itemsByPage = item;
    }

    //workaround for bug ui-select
    $scope.tagHandler = function (tag){
        return null;
    }
    
});
