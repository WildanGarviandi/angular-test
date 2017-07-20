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
            Upload,
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
                data.pickupTypeSimple.forEach(function (pickupType) {
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
                value: '',
            }, {
                key: 'Master',
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
            if (params.merchantID != "" && params.pickupType != 0 && params.originID != 0) {
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
            params.pickupTypeDescription = $scope.pickupType.key;
            params.isDownload = true;

        $window.open('/export?' + mandatoryUrl + '&' + $httpParamSerializer(params));
        return;
    }

    /**
     * Upload Excel file and assign value to scope
     * 
     * @return {void}
    */
    $scope.uploadExcel = function(files, action) {
        var upload = function () {
            var data = {};
            var temp = [];

            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    data.title = files[i].name;
                    data.file = files[i];

                    if (!files[i].$error) {
                        temp.push(data);
                    }
                }
            }

            $scope.import.file = temp;
            return;
        }

        if (action) {
            action()
            .then(upload);
        } else {
            upload();
        }
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
                if (change[1] == "price") {
                    params.price = change[3];
                }

                if ((params.zipCode && params.zipCode !== "") && (params.price && params.price !== "")) {
                    collectDataBeforeSafe(params);
                }
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

        isDataExist = lodash.find($scope.table.data, function(val, key){ 
            if(val['zipcode'] == data.zipCode) {
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

    var responseAddEditDelete = function (result, type) {
        $scope.table.success = result.data;
        $rootScope.$emit('stopSpin');

        var responseText = '';
        var responseType = '';
        var responseSuccess = '';
        var responseError = '';
        var tempSuccess = [];
        var tempError = [];

        result.data.forEach(function (val, key) {
            var message = '';
            var success = {};
            var error = {};

            success.zipCode = val.ZipCode;
            error.zipCode = val.ZipCode;

            if (val.Status == 'success') {
                success.message = 'success';

                tempSuccess.push(success);
            }
            if (val.Status == 'failed') {
                if (val.Error) {
                    message = val.Error;
                }

                error.message = message;

                tempError.push(error);
            }
        });

        if (tempError.length == 0) {
            responseType = 'success';
            responseSuccess += '<table class="table"><thead><tr><th>ZipCode</th><th class="p-l-15">Response</th></tr><thead><tbody>';
            tempSuccess.forEach(function (val) {
                responseSuccess += '<tr><td class="text-left">' + val.zipCode + '</td><td class="text-left p-l-15"> ' + val.message + '</td></tr>';
            });
            responseSuccess += '</tbody></table>';
            responseText = '<h3 class="no-margin">' + $filter('uppercase')(type) + ' PRICE SUCCESS (' + tempSuccess.length + ')</h3>' + responseSuccess;
        }

        if (tempError.length > 0) {
            responseType = 'warning';
            responseError += '<table class="table"><thead><tr><th>ZipCode</th><th class="p-l-15">Reason</th></tr><thead><tbody>';
            tempError.forEach(function (val) {
                responseError += '<tr><td class="text-left">' + val.zipCode + '</td><td class="text-left p-l-15">' + val.message + '</td></tr>';
            });
            responseError += '</tbody></table>';
            responseText = '<h3 class="no-margin">ERROR (' + tempError.length + ')</h3>' + responseError;
        }

        if (tempError.length > 0 && tempSuccess.length > 0) {
            responseType = 'warning';
            responseText = responseError + '<br>' + responseSuccess;
        }

        $scope.getCustomerPrice();
        SweetAlert.swal({
            title: responseType.toUpperCase(), 
            text: '<div class="SweetAlertScrollAble">' + responseText + '</div>', 
            type: responseType,
            html: true,
            customClass: 'alert-big'
        }, function (isConfirm) {
            if (isConfirm) {
                $scope.handsontable.start();
            }
        });
    }

    /**
     * Add, Edit and Delete for zipcode or price. all changed Cell to Server
     * 
     */
    $scope.addNewZipCode = function() {
        var isNotValid = false;
        var params = {};
            params.pickupType = $scope.pickupType.value;
            params.prices = [];

        $scope.table.data.forEach(function(val, idx) {
            if (val['zipcode'] && val['price']) {
                var price = {};
                    price.originID = $scope.port.value;
                    price.destinationZipCode = val['zipcode'];
                    price.price = val['price'] || 0;

                params.prices.push(price);
            } else if (val['zipcode']) {
                isNotValid = true;
            }
        });

        if (!params.prices.length) {
            return SweetAlert.swal('Error', 'please insert zipcode and price', 'error');
        }

        if (isNotValid) {
            return SweetAlert.swal('Error', 'there are empty zipcode or price in a row', 'error');
        }

        $rootScope.$emit('startSpin');

        Services2.saveEcommercePrice({
            merchantID: $scope.merchant.value
        }, params).$promise.then(function (result) {
            responseAddEditDelete(result, 'create / edit');
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

        var params = {};
            params.pickupType = $scope.pickupType.value;
            params.prices = [];

        var countDestinationZipCode = 0;

        $scope.table.data.forEach(function(val, idx) {
            var price = {};
                price.originID = $scope.port.value;
                price.destinationZipCode = val['zipcode'];
            
            if (val['zipcode'] && val['zipcode'] !== "") {
                params.prices.push(price);
                countDestinationZipCode++;
            }
        });

        if (countDestinationZipCode == 0) {
            return SweetAlert.swal('Error', 'please insert zipcode', 'error');
        }

        $rootScope.$emit('startSpin');
        Services2.saveEcommercePrice({
            merchantID: $scope.merchant.value
        }, params).$promise.then(function (result) {
            responseAddEditDelete(result, 'delete');
        })
        .catch(function (error) {
            $scope.table.error = error.data.error.message;
            SweetAlert.swal('Error', error.data.error.message, 'error');
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Initialize import price data
     * 
     */
    $scope.initImportPrice = function () {
        return $q(function (resolve) {
            $scope.import = {};
            $scope.import.file = [];
            $scope.import.error = [];
            $scope.import.success = [];
            resolve();
        });
    }

    /**
     * Delete for zipcode and price. all changed Cell to Server
     * 
     */
    $scope.importPrice = function() {
        var merchantID = $scope.merchant.value;
        var url = config.url + 'price/import-price/merchant/' + merchantID;
        var data = $scope.import;

        if (!data.file.length) { 
            return SweetAlert.swal('Error', 'Please drop excel file', 'error');
        }

        var successFunction = function (response) {
            var row = 2;
            response.data.data.forEach(function(zipCode, index){
                zipCode.row = row;

                if (zipCode.Status == 'failed') {
                    data.error.push(zipCode);
                }

                if (zipCode.Status == 'success') {
                    data.success.push(zipCode);
                }

                row++;
            });

            $scope.getCustomerPrice();
        };

        var errorFunction = function(error) {
            data.serverError = error.data.error.message;
        };

        lodash.forEach(data.file, function(val) {
            var param = {};
                param.pickupType = $scope.pickupType.value;
                param.originID = $scope.port.value;
                param.file = val.file;

            doUpload(url, param, successFunction, errorFunction);
        })
    }

    /**
     * General function to upload file
     * 
     * @return {void}
    */
    var doUpload = function(url, data, successFunction, errorFunction) {
        $rootScope.$emit('startSpin');
        Upload.upload({
            url: url,
            data: data
        }).then(function(response) {
            $rootScope.$emit('stopSpin');
            successFunction(response);
        }).catch(function(error){
            $rootScope.$emit('stopSpin');
            errorFunction(error);
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
