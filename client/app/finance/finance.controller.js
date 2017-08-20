'use strict';

angular.module('adminApp')
    .controller('FinanceCtrl', 
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
        key: 'Picktup Time',
        value: 'pickupTime'
    }];
    $scope.filterBy = $scope.filterBys[0];

    $scope.itemsByPage = $location.search().limit || 10;
    $scope.offset = $location.search().offset || 0;
    $scope.isFirstLoaded = true;
    $scope.isFirstLoadedFilter = false;
    $scope.isFirstLoadedParam = false;

    $scope.pickupType = {
        key: 'All',
        value: 'All'
    };
    $scope.pickupTypes = [$scope.pickupType];

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

    var tableFilter = ['UserOrderNumber', 'DropoffTimeString', 'City', 'OrderStatusString', 
        'PickupTypeDesc', 'Merchant', 'FleetName', 'ZipCode', 'PackageWeight', 
        'LogisticShare', 'HandlingFee', 'OrderCost'];
    
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

    $scope.chooseFilterBy = function (item) {
        $scope.filterBy = item;
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

        var paramFilter = [];
        var tempSelectedFilter = [];
        var isFirstLoadedParam = false;
        tableFilter.forEach(function (val) {
            paramFilter[val] = [];
            tempSelectedFilter[val] = [];

            if ($scope.temp.selectedFilter[val]) {
                $scope.temp.selectedFilter[val].selectedList.forEach(function (data) {
                    paramFilter[val].push(data.value);
                    $scope.temp.isFilterSelected = true;
                });

                $location.search(val, paramFilter[val]);
            }

            var paramUrl = $location.search()[val];
            
            if (paramUrl && paramUrl.length) {
                if (!$scope.isFirstLoadedParam) {
                    paramFilter[val] = paramUrl;
                    var dataFromUrl = '';
                    var tempDataFromUrl = [];

                    if (typeof paramUrl !== 'string') {
                        paramUrl.forEach(function(data){
                            dataFromUrl = parseFloat(data);
                            if (isNaN(dataFromUrl)) {
                                dataFromUrl = data;
                            }
                            tempDataFromUrl.push(dataFromUrl);
                        });

                        paramFilter[val] = tempDataFromUrl;
                    }

                    if (typeof paramUrl === 'string') {
                        dataFromUrl = parseFloat(paramUrl);
                        if (isNaN(dataFromUrl)) {
                            dataFromUrl = paramUrl;
                        }
                        tempDataFromUrl.push(dataFromUrl);
                        paramFilter[val] = tempDataFromUrl;
                    }

                    isFirstLoadedParam = true;
                }
            }
        });

        if (isFirstLoadedParam) {
            $scope.isFirstLoadedParam = true;
        }

        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            statuses: (paramFilter['OrderStatusString']) ? JSON.stringify(paramFilter['OrderStatusString']) : '',
            pickupTypes: (paramFilter['PickupTypeDesc']) ? JSON.stringify(paramFilter['PickupTypeDesc']) : '',
            merchants: (paramFilter['Merchant']) ? JSON.stringify(paramFilter['Merchant']) : '',
            weights: (paramFilter['PackageWeight']) ? JSON.stringify(paramFilter['PackageWeight']) : '',
            dropOffCities: (paramFilter['City']) ? JSON.stringify(paramFilter['City']) : '',
            fleetManagerNames: (paramFilter['FleetName']) ? JSON.stringify(paramFilter['FleetName']) : '',
            dropOffTimes: (paramFilter['DropoffTimeString']) ? JSON.stringify(paramFilter['DropoffTimeString']) : '',
            userOrderNumbers: (paramFilter['UserOrderNumber']) ? JSON.stringify(paramFilter['UserOrderNumber']) : '',
            dropOffZipCodes: (paramFilter['ZipCode']) ? JSON.stringify(paramFilter['ZipCode']) : '',
            handlingFees: (paramFilter['HandlingFee']) ? JSON.stringify(paramFilter['HandlingFee']) : '',
            deliveryFees: (paramFilter['OrderCost']) ? JSON.stringify(paramFilter['OrderCost']) : '',
            logisticShares: (paramFilter['LogisticShare']) ? JSON.stringify(paramFilter['LogisticShare']) : ''
        };

        if (type && type == 'post') {
            var params = {
                statuses: (paramFilter['OrderStatusString']) ? paramFilter['OrderStatusString'] : '',
                pickupTypes: (paramFilter['PickupTypeDesc']) ? paramFilter['PickupTypeDesc'] : '',
                merchants: (paramFilter['Merchant']) ? paramFilter['Merchant'] : '',
                weights: (paramFilter['PackageWeight']) ? paramFilter['PackageWeight'] : '',
                dropOffCities: (paramFilter['City']) ? paramFilter['City'] : '',
                fleetManagerNames: (paramFilter['FleetName']) ? paramFilter['FleetName'] : '',
                dropOffTimes: (paramFilter['DropoffTimeString']) ? paramFilter['DropoffTimeString'] : '',
                userOrderNumbers: (paramFilter['UserOrderNumber']) ? paramFilter['UserOrderNumber'] : '',
                dropOffZipCodes: (paramFilter['ZipCode']) ? paramFilter['ZipCode'] : '',
                handlingFees: (paramFilter['HandlingFee']) ? paramFilter['HandlingFee'] : '',
                deliveryFees: (paramFilter['OrderCost']) ? paramFilter['OrderCost'] : '',
                logisticShares: (paramFilter['LogisticShare']) ? paramFilter['LogisticShare'] : ''
            };
        }

        if ($scope.filterBy && $scope.filterBy.value) {
            var paramFilerDate = $scope.filterBy.value;
            params[paramFilerDate + 'Start'] = $scope.startFilter;
            params[paramFilerDate + 'End'] = $scope.endFilter;
        }

        return params;
    }

    $scope.getFilterListPayoutAndInvoice = function (paramsData) {
        if (!$scope.isFirstLoadedFilter) {
            var params = {};
                params.limit = 1;
                params.offset = paramsData.offset;
                params.dropOffTimeStart = paramsData.dropOffTimeStart;
                params.dropOffTimeEnd = paramsData.dropOffTimeEnd;

            Services2.getListPayoutAndInvoice(params).$promise.then(function (data) {
                params.limit = data.data.count;

                Services2.getListPayoutAndInvoice(params).$promise.then(function (dataFilter) {
                    dataFilter.data.rows.forEach(function (val, index, array) {
                        if (val.DropTime) {
                            array[index].DropoffTimeString = $filter('date')(val.DropTime, 'dd-MM-yyyy');
                        }
                        if (val.DropoffAddress) {
                            array[index].City = (val.DropoffAddress.City) ? val.DropoffAddress.City.toLowerCase() : '';
                            array[index].ZipCode = (val.DropoffAddress.ZipCode) ? val.DropoffAddress.ZipCode : '';
                        }
                        if (val.OrderStatus && val.OrderStatus.OrderStatus) {
                            array[index].OrderStatusString = val.OrderStatus.OrderStatus.toUpperCase();
                            array[index].OrderStatusID = val.OrderStatus.OrderStatusID;
                        }
                        if (val.WebstoreUser) {
                            array[index].Merchant = val.WebstoreUser.FirstName + ' ' + val.WebstoreUser.LastName;
                            array[index].MerchantID = val.WebstoreUser.UserID;
                        }
                        if (val.FleetManager && val.FleetManager.CompanyDetail) {
                            array[index].FleetName = val.FleetManager.CompanyDetail.CompanyName;
                        }
                    });

                    tableFilter.forEach(function (val) {
                        var dataArray = createUniqueArrayOfObjFromKey(dataFilter.data.rows, 'UserOrderID', val, val);
                        if (val == 'OrderStatusString') {
                            var dataArray = createUniqueArrayOfObjFromKey(dataFilter.data.rows, 'UserOrderID', val, 'OrderStatusID');
                        }
                        if (val == 'DropoffTimeString') {
                            var dataArray = createUniqueArrayOfObjFromKey(dataFilter.data.rows, 'UserOrderID', val, 'DropTime');
                        }
                        if (val == 'Merchant') {
                            var dataArray = createUniqueArrayOfObjFromKey(dataFilter.data.rows, 'UserOrderID', val, 'MerchantID');
                        }
                        if (val == 'PickupTypeDesc') {
                            var dataArray = createUniqueArrayOfObjFromKey(dataFilter.data.rows, 'UserOrderID', val, 'PickupType');
                        }

                        $scope.temp.selectedFilter[val] = {};
                        $scope.temp.selectedFilter[val].selectedList = [];

                        if ($location.search()[val]) {
                            $scope.temp.selectedFilter[val].selectedList = lodash.filter(dataArray, function(obj) {
                                var temp = $location.search()[val];
                                if (typeof temp === 'string') {
                                    temp = [temp];
                                }
                                if (temp.indexOf(obj.value.toString()) > -1) {
                                    return obj;
                                };
                            });
                        }
                        
                        $scope.temp.selectedFilter[val].filtered = [];
                        $scope.temp.selectedFilter[val].filtered = dataArray;
                    });
                });
            });
        }

        $scope.isFirstLoadedFilter = true;
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
        var params = $scope.getListParamForPayoutAndInvoicingFeature();
        
        Services2.getListPayoutAndInvoice(params).$promise.then(function(data) {
            params.offset = 0;
            params.limit = data.data.count;

            $scope.getFilterListPayoutAndInvoice(params);
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
        tableFilter.forEach(function (val) {
            $location.search(val, null);
            if ($scope.temp.selectedFilter[val] && $scope.temp.selectedFilter[val].selectedList) {
                $scope.temp.selectedFilter[val].selectedList = [];
            }
        });
        $scope.offset = 0;
        $scope.getListPayoutAndInvoice();
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
            $scope.isFirstLoaded = false;
        } else {
            $scope.offset = state.pagination.start;
        }
        getFinanceFeature();
    };

});
