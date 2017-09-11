'use strict';

angular.module('adminApp')
    .controller('PrebookedOrdersCtrl', 
        function(
            $stateParams,
            $rootScope,
            $location,
            $timeout,
            $window,
            $scope,
            $state,
            $http,
            $q,
            Auth,
            Services,
            Services2,
            moment,
            lodash,
            config,
            Upload,
            ngDialog,
            SweetAlert,
            Printer
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.orderNotFound = [];

    $scope.urlToDownload = {};
    $scope.urlToDownload.templateUpdatePrebookedOrders = '../../assets/template/templateUpdatePrebookedOrders.xlsx';

    $scope.status = {
        key: 'All',
        value: 'All'
    };

    $scope.companies = [{
        CompanyDetailID: 'all',
        CompanyName: 'All'
    }];

    /**
     * Get status
     * 
     * @return {void}
     */
    var getStatus = function() {
        return $q(function (resolve) {
            Services2.getStatus().$promise.then(function(data) {
                $scope.statuses = [];
                $scope.statuses.push($scope.status);
                data.data.rows.forEach(function(status) {
                    $scope.statuses.push({key: status.OrderStatus, value: status.OrderStatusID});
                });
                resolve();
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

        return Services2.getWebstores(params).$promise.then(function (data) {
            $scope.merchants = []; 
            return data.data.webstores.forEach(function(merchant) {
                $scope.merchants.push({
                    key: merchant.webstore.FirstName + ' ' + merchant.webstore.LastName, 
                    value: merchant.webstore.UserID
                });
            });
        });
    }

    /**
     * Get all companies
     * 
     * @return {Object} Promise
     */
    var getCompanies = function () {
        return $q(function (resolve) {
            Services2.getAllCompanies().$promise.then(function(result) {
                var companies = lodash.sortBy(result.data.Companies, function (i) { 
                    return i.CompanyName.toLowerCase(); 
                });
                $scope.companies = $scope.companies.concat(companies);
                $scope.company = $scope.companies[0];
                resolve();
            });
        });
    };

    /**
     * Get all Driver by Fleet
     * 
     * @return {Object} Promise
     */
    var getDriversByFleet = function (params) {
        $scope.import.others.showDriver = false;
        return Services2.getDrivers(params).$promise.then(function(result) {
            params.limit = result.data.Drivers.count;
            Services2.getDrivers(params).$promise.then(function(result) {
                var drivers = [];
                result.data.Drivers.rows.forEach(function(driver){
                    var driverData = {
                        key: driver.UserID, 
                        value: driver.Driver.FirstName + ' ' + driver.Driver.LastName,
                        fleetManagerID: driver.Driver.Driver.FleetManager.UserID
                    };
                    drivers.push(driverData);
                });
                drivers = lodash.sortBy(drivers, function (i) { 
                    return i.value.toLowerCase(); 
                });
                $scope.drivers = drivers;
                $scope.driver = $scope.drivers[0];
                $scope.import.others.showDriver = true;
            });
        });
    };

    /**
     * Assign merchant to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseMerchant = function(item) {
        $scope.merchant = item;
    }

    var getCurrentParam = function () {
        $location.search('offset', $scope.offset);
        var params = {};
            params.offset = $scope.offset;
            params.limit = $scope.itemsByPage;

        return params;
    }

    /**
     * Select all or unselect all orders.
     * 
     * @return {void}
     */
    $scope.checkUncheckSelected = function() {
        $scope.displayed.forEach(function(order) {
            order.Selected = $scope.status.selectedAll;
        });
        $scope.prepareSelectedOrders();
    };

    /**
     * Prepare selected orders.
     * 
     * @return {array}
     */
    $scope.prepareSelectedOrders = function() {            
        var selectedOrders = [];
        $scope.displayed.forEach(function (order) {
            if (order.Selected) {
                selectedOrders.push(order);
            }
        });
 
        $scope.selectedOrders = selectedOrders;
    };

    /**
     * Get all orders
     * 
     * @return {void}
     */
    $scope.getOrder = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        var params = getCurrentParam();

        return Services2.getEmptyOrders(params).$promise.then(function(data) {
            $scope.orderFound = data.data.count;
            $scope.displayed = data.data.rows;
            $rootScope.$emit('stopSpin');
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
            return;
        });
    }
    
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
        getStatus().then($scope.getOrder);
        getMerchants();
        getCompanies();
    }

    /**
     * get choosen data and assign to scope
     * 
     * @return {Object} choosen data into scope 
     */
    $scope.choosenDataToScope = function (type, data, scope) {
        $scope[scope] = data;
        if (type == 'fleet' 
            && $scope.import.others.fleet 
            && $scope.import.others.fleet.User 
            && $scope.import.others.fleet.User.UserID) {

            var paramsGetDriver = {
                offset: 0,
                limit: 1,
                status: 2,
                codStatus: 'all',
                company: 'all',
                availability: 'all',
                company: $scope.import.others.fleet.CompanyDetailID
            };
            getDriversByFleet(paramsGetDriver);
        }
    };

    $scope.toggleScope = function (scope) {
        $scope[scope] = !$scope[scope];
        return scope;
    }

    /**
     * Closed Modal
     * @return void
     */
    $scope.closeModal = function() {
        ngDialog.close();
    }

    /**
     * Upload an image to the cloud, will return a url as a response
     * @param  {File} file - image to be uploaded
     * 
     */
    $scope.uploadPic = function (file) {
        $rootScope.$emit('startSpin');
        if (file) {
            $scope.f = file;
            file.upload = Upload.upload({
                url: config.url + 'upload/picture',
                data: {file: file}
            })
            .then(function (response) {
                file.result = response.data;
                if (response.data.data && !response.data.error) {
                    $scope.f.success = response.data.data.Location;
                } else {
                    $scope.f.error = 'Uploading picture failed. Please try again';
                }
                $rootScope.$emit('stopSpin');
            }, function (response) {
                if (response.status > 0) {
                    $scope.f.error = response.status + ': ' + response.data;
                }
                $rootScope.$emit('stopSpin');
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };

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

    /**
     * Upload Excel file and assign value to scope
     * 
     * @return {void}
    */
    $scope.uploadExcel = function(files, action) {
        $scope.initImport();
        var data = {};
        var temp = [];
        var upload = function () {

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
     * Initialize import data
     * 
     */
    $scope.initImport = function () {
        return $q(function (resolve) {
            $scope.import = {};
            $scope.import.param = {};
            $scope.import.file = [];
            $scope.import.error = [];
            $scope.import.updated = [];
            $scope.import.uploaded = [];
            $scope.import.others = {};
            $scope.f = {};

            $scope.importedDatePicker = moment().add(1, 'hours').toDate();
            $scope.importedDatePickerNow = moment().add(1, 'hours').format('dddd, MMM Do HH:mm');
            $scope.onTimeSet = function (newDate, oldDate) {
                $scope.importedDatePicker = newDate;
                $scope.importedDatePickerNow = moment(newDate).format('dddd, MMM Do HH:mm');
            }

            resolve();
        });
    }

    /**
     * Upload Excel of Orders
     * 
     */
    $scope.updateOrderByExcel = function() {
        var url = config.url + 'order/import-prebooked/xlsx';
        var data = $scope.import;

        if (!data.file.length) { 
            return SweetAlert.swal('Error', 'Please drop excel file', 'error');
        }

        var successFunction = function (response) {
            $scope.import.file = [];
            response.data.data.forEach(function(order, index){
                var row = index + 2;
                if (order.isCreated) {
                    data.uploaded.push(order);
                } else if (order.isUpdated) {
                    data.updated.push(order);
                } else {
                    data.uploaded.push(order);
                }
            });

            $scope.getOrder();
        }

        var errorFunction = function(error) {
            $scope.import.file = [];
            var errorMessage = error.data.error.message;
            try {
                var errorMessageParse = JSON.parse(errorMessage);
                
                if (errorMessageParse && errorMessageParse.length > 0) {
                    errorMessageParse.forEach(function(order, index){
                        var row = index + 2;
                        data.error.push({row: row, list: order.error});
                    });
                }
            } catch (e) {
                if (errorMessage instanceof Array) {
                    errorMessage.forEach(function(order, index){
                        if (order.order) {
                            data.error.push({order: order.order, reason: order.reason});
                        }
                    });
                }

                if (!(errorMessage instanceof Array)) {
                    data.error.push({format: errorMessage});
                }
            }
        }

        lodash.forEach(data.file, function(val) {
            var param = {};
                param.file = val.file;
                param.pickupTime = $scope.importedDatePicker;

            if ($scope.f.success) {
                param.proofOfPickupUrl = $scope.f.success;
            }
            if (data.others.showMerchant) {
                param.merchantID = data.others.merchant.value;    
            }
            if (data.others.showFleet) {
                param.fleetManagerID = data.others.fleet.User.UserID;
                param.driverID = data.others.driver.key;
            }

            doUpload(url, param, successFunction, errorFunction);
        })
    }

    $scope.createEmptyOrders = function () {
        if ($scope.onModal.quantity <= 0) {
            return SweetAlert.swal('Error', 'Please input Number of Orders', 'error');
        }

        var params = {};
            params.quantity = $scope.onModal.quantity;

        $rootScope.$emit('startSpin');
        return Services2.createEmptyOrders(params).$promise.then(function(data) {
            $rootScope.$emit('stopSpin');
            $scope.closeModal();
            SweetAlert.swal('Success', data.data.length + ' empty orders are created', 'success');
            $scope.getOrder();
        });
    }

    var barcodeGenerator = function (value) {
        var canvas = document.createElement("canvas");
        var settings = {
            height: 20,
            width: 2,
            fontSize: 14
        };

        JsBarcode(canvas, value, settings);
        return canvas.toDataURL("image/png");
    }

    $scope.print = function () {
        $scope.selectedOrders.forEach(function (val, index, array) {
            array[index].Barcode = barcodeGenerator(val.UserOrderNumber);
        });

        var templateUrl = '../../assets/prints/prebookedOrders.html';
        var data = {};
            data.orders = $scope.selectedOrders;
            data.setting = {
                paperSize: 'airwayBill',
                paperOrientation: 'landscape',
                cssURL: ['../../app/prebookedOrder/printPrebookedOrder.css']
            };

        Printer.print(templateUrl, data);
    }

});