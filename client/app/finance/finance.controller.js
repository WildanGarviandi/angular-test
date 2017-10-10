'use strict';

angular.module('adminApp')
    .controller('FinanceCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope, 
            Services, 
            Services2,
            Webstores,
            moment, 
            lodash, 
            $state, 
            $stateParams,
            $location, 
            $http, 
            $httpParamSerializer,
            $window,
            $q,
            config,
            Upload,
            $timeout,
            $filter,
            ngDialog,
            SweetAlert
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.datePickerOptions = {
        'showWeeks': false,
        'formatDay': 'd'
    };

    $scope.temp = {
        list: [],
        data: {},
        dataUpdated: {},
        selectedAllListTable: false,
        selectedAllList: false,
        isListSelected: false,
        isListSelectedContain: {},
        selectedList: [],
        selectedFilter: [],
        isFilterSelected: false
    };

    $scope.modalTemplate = {
        templateName: '',
        nextTemplateName: '',
        title: '',
        description: ''
    };

    $scope.tabs = {
        active: {
            deliveryFee: false,
            handlingFee: false
        },
        disable: {
            deliveryFee: false,
            handlingFee: false
        }
    }

    $scope.startFilter = $location.search().startFilter || null;
    $scope.endFilter = $location.search().endFilter || null;

    $scope.financeFeature = {
        key: 'Choose finance feature ...',
        value: 0
    };

    $scope.filterBys = [{
        key: 'Delivered + Return Time',
        value: 'dropOffTime'
    }, {
        key: 'Pickup Time',
        value: 'pickupTime'
    }];
    $scope.filterBy = $scope.filterBys[0];

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.isFirstLoadedFilter = false;
    $scope.isFirstLoadedParam = false;

    $scope.merchant = {
        key: 'All',
        value: ''
    };
    $scope.merchants = [$scope.merchant];
    $scope.fleet = {
        key: 'All',
        value: ''
    };
    $scope.fleets = [$scope.fleet];
    $scope.pickupType = {
        key: 'All',
        value: ''
    };
    $scope.pickupTypes = [$scope.pickupType];
    $scope.status = {
        key: 'All',
        value: ''
    };
    $scope.statuses = [$scope.status];

    $scope.actionPayoutAndInvoice = {
        'showFilter': false,
        'showTable': false
    };

    $scope.actionProfitAndLoss = {
        'showFilter': false
    };

    $scope.actionOrderSummary = {
        'showFilter': false
    };

    $scope.financeFeatures = [];

    var keyOfDifferentSelected = ['WebstoreUser','DropoffAddress','FleetManager'];

    // Here, model and param have same naming format for choose finance feature
    var pickedFinanceFeature = {
        'FinanceFeature': {
            model: 'financeFeature',
            pick: 'value',
            collection: 'financeFeatures'
        }
    };

    var filterDatePayoutAndFinance = [
        'startFilter',
        'endFilter'
    ];

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
            $scope.pickupTypes = $scope.pickupTypes.concat(data.pickupTypes);
            $scope.financeFeatures = $scope.financeFeatures.concat(data.financeFeature);
        });
    };

    getDefaultValues();

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function createUniqueArrayOfObjFromKey(dataArray, id, text, value) {
        if (text == 'DropoffTimeString') {
            return lodash.map(lodash.uniq(dataArray, text), function (obj) {
                return {
                    key: obj[id],
                    text: $filter('date')(obj[text], 'dd-MM-yyyy'),
                    value: $filter('date')(obj[value], 'yyyy-MM-dd')
                };
            });
        }

        return lodash.map(lodash.uniq(dataArray, text), function (obj) {
            return {
                key: obj[id],
                text: obj[text],
                value: obj[value]
            };
        });
    };

    function resetActionFinanceFeature (action) {
        for (var key in action) {
            if (action.hasOwnProperty(key)) {
                action[key] = false;
            }
        }
    }

    function getFinanceFeature () {
        lodash.each(pickedFinanceFeature, function (val) {
            var value = $location.search()[val.model] || $scope[val.model][val.pick];
            var findObject = {};
            findObject[val.pick] = (parseInt(value)) ? parseInt(value) : value;
            $scope[val.model] = lodash.find($scope[val.collection], findObject);

            resetActionFinanceFeature($scope.actionPayoutAndInvoice);
            resetActionFinanceFeature($scope.actionProfitAndLoss);
            resetActionFinanceFeature($scope.actionOrderSummary);

            if (value == 1) {
                $scope.actionPayoutAndInvoice.showFilter = true;
                if ($scope.startFilter && $scope.endFilter) {
                    $scope.getListPayoutAndInvoice();
                }
            }
            if (value == 2) {
                $scope.actionProfitAndLoss.showFilter = true;
            }
            if (value == 3) {
                $scope.actionOrderSummary.showFilter = true;
            }
        });
    }

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
    };

    var getMerchants = function() {
        var params = {};
            params.status = 2;

        return $q(function (resolve) {
            Webstores.getWebstore(params).$promise.then(function (data) {
                data.data.webstores.forEach(function(merchant) {
                    $scope.merchants.push({
                        key: merchant.webstore.FirstName + ' ' + merchant.webstore.LastName,
                        value: merchant.webstore.UserID
                    });
                });
                resolve();
            });
        });
    };

    var getFleets = function () {
        return $q(function (resolve) {
            Services2.getAllCompanies().$promise.then(function(result) {
                result.data.Companies.forEach(function(company){
                    $scope.fleets.push({
                        key: company.CompanyName.toLowerCase(),
                        value: company.User.UserID
                    });
                });
                resolve();
            });
        });
    };

    var chooseVariables = {
        'Status': {
            model: 'status',
            pick: 'value',
            collection: 'statuses'
        },
        'PickupType': {
            model: 'pickupType',
            pick: 'value',
            collection: 'pickupTypes'
        },
        'Merchant': {
            model: 'merchant',
            pick: 'value',
            collection: 'merchants'
        },
        'Fleet': {
            model: 'fleet',
            pick: 'value',
            collection: 'fleets'
        }
    };

    // Generates
    // chooseStatus, choosePickupType, chooseOrderType
    lodash.each(chooseVariables, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
        };
    });

    var searchVariables = {
        'ZipCode': {
            model: 'zipCode',
            param: 'zipCode'
        },
        'Weight': {
            model: 'weight',
            param: 'weight'
        },
        'DeliveryFee': {
            model: 'deliveryFee',
            param: 'deliveryFee'
        },
    };

    // Generates:
    // searchOrder, searchDriver, searchMerchant, searchPickup, searchDropoff,
    // searchSender, searchRecipient, searchFleet
    lodash.each(searchVariables, function (val, key) {
        $scope['search' + key] = function(event){
            $location.search(val.param, $scope[val.model]);
        };
    });

    /**
     * Add search DropoffTime
     * 
     * @return {void}
     */
    $scope.searchDropOffTime = function(event) {
        var dropOffTime = ($scope.dropOffTime) ? moment($scope.dropOffTime).format('YYYY-MM-DD') : '';
        $location.search('dropOffTime', dropOffTime);
    }

    $scope.chooseFilterBy = function (item) {
        $scope.filterBy = item;
    }

    var getFilterListPayoutAndInvoice = function (callback) {
        if (!$scope.isFirstLoadedFilter && !$scope.isFirstLoaded) {
            getStatus()
            .then(getMerchants)
            .then(getFleets)
            .then(callback);
        } else {
            if (!$scope.isFirstLoaded) {
                callback();
            }
            if ($scope.isFirstLoaded) {
                getStatus()
                .then(getMerchants)
                .then(getFleets)
                .then(callback);
            }
        }
    }

    $scope.getListParamForPayoutAndInvoicingFeature = function (type) {
        $location.search('offset', $scope.offset);

        if ($scope.startFilter) {
            $scope.startFilter = new Date($scope.startFilter);     
        }
        if ($scope.endFilter) {
            $scope.endFilter = new Date($scope.endFilter);
        }

        lodash.each(filterDatePayoutAndFinance, function (val) {
            $scope[val] = $location.search()[val] || $scope[val];
        });

        lodash.each(searchVariables, function (val, key) {
            $scope[val.model] = $location.search()[val.param] || $scope[val.model];
        });

        lodash.each(chooseVariables, function (val, key) {
            var value = $location.search()[val.model] || ($scope[val.model]) ? $scope[val.model][val.pick] : '';
            var findObject = {};
            findObject[val.pick] = (parseInt(value)) ? parseInt(value) : value;
            $scope[val.model] = lodash.find($scope[val.collection], findObject);
        });

        $scope.dropOffTime = $location.search()['dropOffTime'] || $scope.dropOffTime;

        if (!$scope.isFirstLoadedFilter) {
            $scope.isFirstLoadedFilter = true;
        }

        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage
        };

        if (type && type == 'post') {
            params = {};
        }

        params.statuses = ($scope.status && $scope.status.value) ? JSON.stringify([$scope.status.value]) : '';
        params.pickupTypes = ($scope.pickupType && $scope.pickupType.value) ? JSON.stringify([$scope.pickupType.value]) : '';
        params.merchants = ($scope.merchant && $scope.merchant.value) ? JSON.stringify([$scope.merchant.value]) : '';
        params.weights = $scope.weight ? JSON.stringify([$scope.weight]) : '';
        params.fleetManagerNames = ($scope.fleet && $scope.fleet.value) ? JSON.stringify([$scope.fleet.key]) : '';
        params.dropOffTimes = $scope.dropOffTime ? JSON.stringify([moment($scope.dropOffTime).format('YYYY-MM-DD')]) : '';
        params.dropOffZipCodes = $scope.zipCode ? JSON.stringify([$scope.zipCode]) : '';
        params.deliveryFees = $scope.deliveryFee ? JSON.stringify([$scope.deliveryFee]) : '';

        if ($scope.filterBy && $scope.filterBy.value) {
            var paramFilerDate = $scope.filterBy.value;
            params[paramFilerDate + 'Start'] = $scope.startFilter;
            params[paramFilerDate + 'End'] = $scope.endFilter;
        }

        return params;
    }

    $scope.getListParamForProfitAndLossFeature = function () {
        if ($scope.startFilter) {
            $scope.startFilter = $scope.startFilter;     
        }
        if ($scope.endFilter) {
            $scope.endFilter = $scope.endFilter;
        }

        lodash.each(filterDatePayoutAndFinance, function (val) {
            $scope[val] = $location.search()[val] || $scope[val];
        });

        var params = {};
            params.start = $scope.startFilter;
            params.end = $scope.endFilter;

        if ($scope.filterBy && $scope.filterBy.value == 'pickupTime') {
            params.pickupTimeOrDropoffTime = 1;
        }
        if ($scope.filterBy && $scope.filterBy.value == 'dropOffTime') {
            params.pickupTimeOrDropoffTime = 2;
        }

        return params;
    }

    /**
     * Get list payout and invoice data
     * 
     * @return {void}
     */
    $scope.getListPayoutAndInvoice = function () {
        $rootScope.$emit('startSpin');
        $scope.temp.selectedList = [];
        $scope.temp.selectedAllList = false;
        $scope.actionPayoutAndInvoice.showTable = false;

        getFilterListPayoutAndInvoice(function () {
            var params = $scope.getListParamForPayoutAndInvoicingFeature();
            return Services2.getListPayoutAndInvoice(params).$promise.then(function(data) {
                params.offset = 0;
                params.limit = data.data.count;

                $scope.actionPayoutAndInvoice.showTable = true;
                $scope.totalData = data.data.count;
                $scope.temp.list = data.data.rows;
                $scope.displayed = data.data.rows;
                $scope.tableState.pagination.numberOfPages = Math.ceil(
                    data.data.count / $scope.tableState.pagination.number);

                $scope.temp.list.forEach(function (val, index, array) {
                    if ($scope.temp.selectedAllListTable) {
                        array[index].Selected = true;
                        return;
                    }
                });

                $rootScope.$emit('stopSpin');
            }).catch(function (e) {
                $rootScope.$emit('stopSpin');
            });
        });
    }

    $scope.export = function (type) {
        if (type == 'payoutAndInvoice') {
            var mandatoryUrl = 'exportType=' + type + '&' + 'maxExport=' + $scope.totalData;
            var params = $scope.getListParamForPayoutAndInvoicingFeature();
            $window.open('/export?' + mandatoryUrl + '&' + $httpParamSerializer(params));
        }
        if (type == 'profitAndLoss' || type == 'orderSummary') {
            var mandatoryUrl = 'exportType=' + type + '&' + 'maxExport=' + $scope.totalData;
            var params = $scope.getListParamForProfitAndLossFeature();
            $scope.closeModal();
            $window.open('/export?' + mandatoryUrl + '&' + $httpParamSerializer(params));
        }
    }

    $scope.updatePriceAuto = function () {
        var params = $scope.getListParamForPayoutAndInvoicingFeature('post');
        $rootScope.$emit('startSpin');
        Services2.orderUpdatePriceAuto(params).$promise.then(function (result) {
            SweetAlert.swal({
                title: "Auto Update Fee Success", 
                text: "success", 
                type: "success",
                html: true,
                customClass: 'alert-big'
            }, function (isConfirm) {
                if (isConfirm) {
                    $window.location.reload()
                }
            });
        }).catch(function (e) {
            $rootScope.$emit('stopSpin');
            SweetAlert.swal({
                title: (e.data.message) ? e.data.message : 'Failed in marking status as PICKUP', 
                text: e.data.error.message, 
                type: "error",
                html: true,
                customClass: 'alert-big'
            }, function (isConfirm) {
                if (isConfirm) {
                    $window.location.reload()
                }
            });
        });
    }

    function paramForUpdatePriceManual (singleData) {
        var param = {};
        var deliveryFee = '';
        var handlingFee = '';
        var logisticShare = '';
        var dataUpdated = $scope.temp.dataUpdated;

        param.orderID = singleData.UserOrderID;

        if ($scope.tabs.active.deliveryFee) {
            deliveryFee = dataUpdated.DeliveryFee;
            
            if (dataUpdated.isCalculateByWeight) {
                deliveryFee = singleData.PackageWeight * deliveryFee;    
            }

            if (dataUpdated.isJabodetabekAreaSelected) {
                logisticShare = dataUpdated.LogisticShare;
                handlingFee = deliveryFee * (logisticShare / 100);

                param.logisticShare = logisticShare;
                param.handlingFee = handlingFee;
            }

            param.deliveryFee = deliveryFee;            
        }

        if ($scope.tabs.active.handlingFee) {
            handlingFee = dataUpdated.HandlingFee;
            if (dataUpdated.isCalculateByWeight) {
                handlingFee = singleData.PackageWeight * handlingFee;
            }

            param.handlingFee = handlingFee;
        }

        return param;
    }

    $scope.generateSuccessAndReload = function (text) {
        SweetAlert.swal({
            title: "Success", 
            text: text, 
            type: "success"
        }, function (isConfirm) {
            if (isConfirm) {
                $window.location.reload()
            }
        });
    };

    $scope.generateError = function (text) {
        SweetAlert.swal({
            title: 'Error',
            text: text,
            type: 'error'
        });
    };

    $scope.updatePriceManual = function () {
        var params = {
                data: []
            };

        if ($scope.tabs.active.deliveryFee) {
            if (!$scope.temp.dataUpdated.DeliveryFee) {
                return $scope.generateError('Delivery Fee cannot be empty');
            }

            if ($scope.temp.dataUpdated.isJabodetabekAreaSelected && !$scope.temp.dataUpdated.LogisticShare) {
                return $scope.generateError('Logistic Share cannot be empty');
            }
        }

        if ($scope.tabs.active.handlingFee && !$scope.temp.dataUpdated.HandlingFee) {
            return $scope.generateError('Handling Fee cannot be empty');
        }

        if ($scope.temp.isListSelected) {
            $scope.temp.selectedList.forEach(function (val, index) {
                params.data.push(paramForUpdatePriceManual(val));
            });
        } else {
            params.data.push(paramForUpdatePriceManual($scope.temp.data));
        }
        
        Services2.orderUpdatePriceManual(params).$promise.then(function (result) {
            $scope.generateSuccessAndReload('Update Manual Price Success');
        }).catch(function (e) {
            $scope.generateError(e.data.error.message);
        });
    }

    // FILTERING
    // Generates
    // chooseFinanceFeature
    lodash.each(pickedFinanceFeature, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
            $scope.offset = 0;
            $scope.tableState.pagination.start = 0;

            getFinanceFeature();
        };
    });

    // Generated scope:
    // startDropoff, endDropoff
    filterDatePayoutAndFinance.forEach(function (val) {
        $scope.$watch(
            (val),
            function (date) {
                if (Date.parse(date)) {
                    $location.search(val, (new Date(date)).toISOString());
                }
            }
        );
    });

    /**
     * Select all or unselect all data in list.
     * 
     * @return {void}
     */
    $scope.checkUncheckSelectedAllInTable = function(value) {
        $scope.temp.selectedAllListTable = value;
        $scope.temp.selectedAllList = value;
        $scope.checkUncheckSelectedAll();
    };

    /**
     * Select all or unselect all data in list.
     * 
     * @return {void}
     */
    $scope.checkUncheckSelectedAll = function() {
        if (!$scope.temp.selectedAllList) {
            $scope.temp.selectedAllListTable = $scope.temp.selectedAllList;
        }

        $scope.temp.list.forEach(function(data) {
            data.Selected = $scope.temp.selectedAllList;
        });

        $scope.prepareSelectedList();
    };
 
    /**
     * Check whether there is one or more data selected in list.
     * 
     * @return {boolean}
     */
    $scope.selectedDataExists = function(type) {
        var checked = false;
        $scope.temp.list.some(function(data) {
            if (data.Selected) {
                checked = true;
                return;
            }
        });
 
        return checked;
    };
 
    /**
     * Prepare selected list.
     * 
     * @return {array}
     */
    $scope.prepareSelectedList = function() {            
        var selectedList = [];
        var tempObj = '';

        keyOfDifferentSelected.forEach(function (val) {
            $scope.temp.isListSelectedContain['different' + val] = false;
        });

        $scope.temp.list.forEach(function (data) {
            if (data.Selected) {
                selectedList.push(data);

                if (tempObj) {
                    keyOfDifferentSelected.forEach(function (val) {
                        var isEqual = lodash.isEqual(data[val], tempObj[val]);
                        if (!isEqual) {
                            $scope.temp.isListSelectedContain['different' + val] = !isEqual;
                        }
                    });
                }

                tempObj = data;
            }
        });
 
        $scope.temp.selectedList = selectedList;

        $scope.temp.isListSelected = false;
        if ($scope.selectedDataExists()) {
            $scope.temp.isListSelected = true;
        }
    };

    $scope.filterDate = function () {
        $scope.offset = 0;
        $scope.getListPayoutAndInvoice();
    }

    $scope.searchList = function () {
        $scope.offset = 0;
        $scope.getListPayoutAndInvoice();
    }

    $scope.resetFilter = function () {
        var params = {};
            params.financeFeature = $location.search().financeFeature;
            params.startFilter = $location.search().startFilter;
            params.endFilter = $location.search().endFilter;

        $window.location.href = '/finance?' + $httpParamSerializer(params);
    }

    $scope.modalTemplateGenerator = function (type, category, nextTemplateName, nextTitle, functionOnSubmit) {
        var templateName = 'modal' + capitalizeFirstLetter(type);
        $scope.modalTemplate = {};
        $scope.modalTemplate.templateName = templateName;
        $scope.modalTemplate.nextTemplateName = nextTemplateName;
        $scope.modalTemplate.nextTitle = nextTitle;
        $scope.modalTemplate.action = 'Update';

        $scope.onSubmitInTemplate = function () {
            $scope.showDetailModal(nextTemplateName, $scope.data, true);
        };

        if (functionOnSubmit) {
            $scope.onSubmitInTemplate = functionOnSubmit;
        }

        if (type == 'confirmation') {
            var isValid = false;
            var imageUrl = '';
            var textDescription = '';
            var title = '';
            var description = '';

            if (category == 'AutoUpdateFee') {
                title = 'You choose to bulk auto update fee';
                imageUrl = '../../assets/images/icon-question-mark.png';
                textDescription = 'It will update All orders.';
                description = '<img class="img-center" src="'+imageUrl+'">'
                                                +'<p class="text-center">'+textDescription+'</p>';
            }

            if (category == 'OrderCost') {
                $scope.tabs.active.deliveryFee = true;
                $scope.tabs.active.handlingFee = false;
                $scope.tabs.disable.deliveryFee = false;
                $scope.tabs.disable.handlingFee = true;

                title = 'You are selecting different <br> (Merchant and / or city).';
                imageUrl = '../../assets/images/icon-question-mark.png';
                textDescription = 'Are you sure you want to update delivery fee?';
                description = '<img class="img-center" src="'+imageUrl+'">'
                                                +'<p class="text-center">'+textDescription+'</p>';

                if (!$scope.temp.isListSelectedContain.differentWebstoreUser
                    && !$scope.temp.isListSelectedContain.differentDropoffAddress) {
                    isValid = true;
                }
            }

            if (category == 'HandlingFee') {
                $scope.tabs.active.deliveryFee = false;
                $scope.tabs.active.handlingFee = true;
                $scope.tabs.disable.deliveryFee = true;
                $scope.tabs.disable.handlingFee = false;

                title = 'You are selecting different <br> (Fleet and / or city).';
                imageUrl = '../../assets/images/icon-question-mark.png';
                textDescription = 'Are you sure you want to update handling fee?';
                description = '<img class="img-center" src="'+imageUrl+'">'
                                                +'<p class="text-center">'+textDescription+'</p>';

                if (!$scope.temp.isListSelectedContain.differentDropoffAddress 
                    && !$scope.temp.isListSelectedContain.differentFleetManager) {
                    isValid = true;
                }
            }

            if (category == 'ExportProfitAndLoss') {
                $scope.modalTemplate.action = 'Export';
                $scope.onSubmitInTemplate = function () {
                    $scope.export('profitAndLoss');
                };

                title = 'Export Profit and Loss';
                imageUrl = '../../assets/images/icon-question-mark.png';
                textDescription = 'It will export from ' + moment($scope.startFilter).format('MMMM YYYY') + ' - ' + moment($scope.endFilter).format('MMMM YYYY');
                description = '<img class="img-center" src="'+imageUrl+'">'
                    +'<p class="text-center">'+textDescription+'</p>';
            }

            if (category == 'ExportOrderSummary') {
                $scope.modalTemplate.action = 'Export';
                $scope.onSubmitInTemplate = function () {
                    $scope.export('orderSummary');
                };

                title = 'Export Order Summary';
                imageUrl = '../../assets/images/icon-question-mark.png';
                textDescription = 'It will export from ' + moment($scope.startFilter).format('MMMM YYYY') + ' - ' + moment($scope.endFilter).format('MMMM YYYY');
                description = '<img class="img-center" src="'+imageUrl+'">'
                    +'<p class="text-center">'+textDescription+'</p>';
            }

            if (isValid) {
                return $scope.showDetailModal(nextTemplateName, $scope.data, true);
            }

            $scope.modalTemplate.title = title;
            $scope.modalTemplate.description = description;
        }

        return ngDialog.open({
            template: templateName,
            scope: $scope,
            className: 'ngdialog-theme-default modal-custom no-padding edit-pickup-address-popup'
        });
    }

    $scope.closeModal = function () {
        ngDialog.close();
    }

    $scope.showDetailModal = function (template, data, isDirect) {
        $scope.temp.data = null;

        if (template == 'modalOrderDetail') {
            Services2.getDetailPayoutAndInvoice({
                orderID: data.UserOrderID
            }).$promise.then(function (result) {
                $scope.temp.data = result.data;
                $scope.temp.data.PickupType = (lodash.find($scope.pickupTypes, {value: result.data.PickupType})).key;
            });
        } else {
            if (!isDirect) {
                $scope.tabs.active.deliveryFee = true;
                $scope.tabs.active.handlingFee = false;
                $scope.tabs.disable.deliveryFee = false;
                $scope.tabs.disable.handlingFee = false;
            }

            $scope.temp.dataUpdated = {};
            $scope.temp.data = data;
        }

        ngDialog.open({
            template: template,
            scope: $scope,
            className: 'ngdialog-theme-default modal-custom no-padding edit-pickup-address-popup'
        });
    }

    // REDIRECTING

    /**
     * Redirect to previous page
     * 
     * @return {void}
     */
    $scope.backButton = function() {
        $window.history.back();
    };

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
        } else {
            $scope.offset = state.pagination.start;
        }
        getFinanceFeature();
        $scope.isFirstLoaded = false;
    };

});
