'use strict';

angular.module('adminApp')
    .controller('ExportCtrl', 
        function(
            $scope, 
            Auth, 
            $rootScope,
            Services2,
            $location, 
            $window,
            $filter,
            lodash,
            moment,
            SweetAlert,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    }).then(function () {
        fetchDataJson(type);
    });

    var dataArray = [];
    var type = $location.search()['exportType'];
    var sheetName = '';
    var maxExport = $location.search()['maxExport'];
    var params = $location.search();
    delete params['exportType'];
    delete params['maxExport'];

    /** settings **/
    var limitError = 5;
    var batchError = 0;
    var limit = 200;
    var batch = Math.ceil(maxExport / limit);
    var batchPosition = 0;
    var fetchingRow = 0;

    /** report for user **/
    $scope.isExportTypeExist = true;
    $scope.progress = {};
    $scope.progress.maxExport = maxExport;
    $scope.progress.export = 0;
    $scope.progress.percentage = 0;
    $scope.progress.message = 'initialize ...';

    var getDescendantProp = function (obj, desc) {
        var arr = desc.split(".");
        while(arr.length && (obj = obj[arr.shift()]));
        var result = (obj) ? obj : '';
        return result;
    }

    var customInit = function (callback) {
        if (batchPosition == 0) {
            callback();
        }
    }

    var buildArray = function (data, batchPosition, template) {
        if (data && data.data && data.data.length) {
            if (batchPosition == 0) {
                var header = Object.keys(data.data[0]);

                if (template) {
                    var header = [];
                    if (template.sheetName) {
                        sheetName = template.sheetName.index;
                        if (template.sheetName.value) {
                            sheetName += ' ' + getDescendantProp(data.data[0], template.sheetName.value);
                        }
                    }
                    if (template.initRow) {
                        template.initRow.forEach(function (val) {
                            var tempInitRow = [];
                            tempInitRow.push(val.index);
                            if (val.value && val.value instanceof Array) {
                                var tempValue = '';
                                val.value.forEach(function (objectKey) {
                                    tempValue += ' ' + getDescendantProp(data.data[0], objectKey);
                                });
                                tempInitRow.push(tempValue);
                            } else if (val.value) {
                                tempInitRow.push(getDescendantProp(data.data[0], val.value));
                            }
                            dataArray.push(tempInitRow);
                        });
                    }
                    if (template.header) {
                        var tempHeader = [];
                        template.header.forEach(function (val) {
                            tempHeader.push(val.index);
                        });
                        header = tempHeader;
                    }
                }

                dataArray.push(header);
            }

            angular.forEach(data.data, function (val, key) {
                var datas = Object.values(val);

                if (template && template.header) {
                    var tempDatas = [];
                    template.header.forEach(function (value) {
                        if (value.value instanceof Array) {
                            var tempValue = '';
                            value.value.forEach(function (objectKey) {
                                tempValue += ' ' + getDescendantProp(val, objectKey);
                            });
                            tempDatas.push(tempValue);
                        } else if (value.value) {
                            tempDatas.push(getDescendantProp(val, value.value));
                        } else {
                            tempDatas.push(value.custom);
                        }
                    });
                    datas = tempDatas;
                }

                dataArray.push(datas);
            });
        }
    }

    var forceBuildExcel = function (data, template) {
        $scope.progress.export = maxExport;
        $scope.progress.percentage = ($scope.progress.export / maxExport) * 100;

        buildArray(data, batchPosition, template);

        return buildExcel(type);
    }

    var successFunction = function (data, template, buildCustomArray) {
        $scope.progress.export += params.limit;
        $scope.progress.percentage = ($scope.progress.export / maxExport) * 100;

        if (buildCustomArray) {
            buildCustomArray(data, batchPosition);
        } else {
            buildArray(data, batchPosition, template);
        }

        batchPosition++;

        if (batchPosition < batch) {
            getDataJson(params.limit * batchPosition);
        } else {
            $scope.progress.percentage = 100;
            $scope.progress.export = $scope.progress.maxExport;
            return buildExcel(type);
        }
    }

    var errorFunction = function (text) {
        return SweetAlert.swal({
            title: 'Error',
            text: text,
            type: 'error'
        });
    }

    var getDataJson = function (offset) {
        $scope.isExportTypeExist = false;
        fetchingRow = offset + limit;
        params.offset = offset;
        if (!offset) {
            params.offset = 0;
            fetchingRow = limit;
        }

        if ((params.offset + limit) > maxExport) {
            params.limit = maxExport - params.offset;
            fetchingRow = maxExport;
        }
            
        fetchingRow = $filter('localizenumber')($filter('number')(fetchingRow));
        var totalRow = $filter('localizenumber')($filter('number')(maxExport));

        $scope.progress.message = 'fetching ' + fetchingRow + ' orders from ' + totalRow;

        if (type == 'standard') {
            $scope.isExportTypeExist = true;

            return Services2.exportStandardFormatJson(params).$promise
            .then(function(data) {
                batchError = 0;
                successFunction(data);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'uploadable') {
            $scope.isExportTypeExist = true;

            return Services2.exportUploadableFormatJson(params).$promise
            .then(function(data) {
                batchError = 0;
                successFunction(data);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'returnedOrders') {
            $scope.isExportTypeExist = true;

            return Services2.exportReturnedOrders(params).$promise
            .then(function(data) {
                batchError = 0;
                successFunction(data);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'userReferral') {
            $scope.isExportTypeExist = true;

            return Services2.exportReferral(params).$promise
            .then(function(datas) {
                var data = {};
                    data.data = datas.data.rows;
                batchError = 0;
                successFunction(data);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'webstore') {
            $scope.isExportTypeExist = true;

            return Services2.exportWebstore(params).$promise
            .then(function(datas) {
                var data = {};
                    data.data = datas.data.rows;
                batchError = 0;
                successFunction(data);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'price') {
            $scope.isExportTypeExist = true;

            var template = {
                sheetName: {
                    index: 'Customer Price'
                },
                header: [
                    {
                        index: 'webstoreID',
                        value: 'Webstore.UserID'
                    }, {
                        index: 'webstoreName',
                        value: ['Webstore.FirstName', 'Webstore.LastName']
                    }, {
                        index: 'pickupType',
                        custom: params.pickupTypeDescription
                    }, {
                        index: 'originTLC',
                        value: 'Origin.TLC'
                    }, {
                        index: 'destinationProvince',
                        value: 'Destination.Province'
                    }, {
                        index: 'destinationCity',
                        value: 'Destination.City'
                    }, {
                        index: 'destinationDistrict',
                        value: 'Destination.District'
                    }, {
                        index: 'destinationZipCode',
                        value: 'Destination.ZipCode'
                    }, {
                        index: 'price',
                        value: 'Price'
                    }
                ]
            };

            if (batchPosition > 0) {
                params.isDownload = false;
            }

            return Services2.getEcommercePrices(params).$promise
            .then(function(data) {
                batchError = 0;
                successFunction(data.data, template);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'codpayment') {
            $scope.isExportTypeExist = true;

            return Services2.exportCODPayment(params).$promise
            .then(function(data) {
                if (!data.data.length) {
                    return errorFunction('Empty Data');
                };
                batchError = 0;
                forceBuildExcel(data);
            }).catch(function (e) {
                return errorFunction(e.data.error.message);
            });
        }

        if (type == 'payoutAndInvoice') {
            $scope.isExportTypeExist = true;

            return Services2.exportPayoutAndInvoice(params).$promise
            .then(function(data) {
                batchError = 0;
                successFunction(data);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'profitAndLoss') {
            $scope.isExportTypeExist = true;
            customInit(function () {
                var getAbsoulteMonths = function (momentDate) {
                    var months = Number(momentDate.format("MM"));
                    var years = Number(momentDate.format("YYYY"));
                    return months + (years * 12);
                }

                var start = moment(params.start);
                var end = moment(params.end);
                var diff = Math.ceil(getAbsoulteMonths(end) - getAbsoulteMonths(start)) + 1;

                limit = 1;
                batch = diff;
                maxExport = diff;
                $scope.progress.maxExport = diff;

                params.limit = limit;
                params.month = parseInt(moment(params.end).format('M'));
                params.year = parseInt(moment(params.end).format('YYYY'));
            });

            if (offset) {
                params.month = params.month - limit;
                if (params.month < 1) {
                    params.year = (params.month == 0) ? params.year - 1 : params.year;
                    params.month = 12 - params.month;
                }
            }

            return Services2.exportProfitAndLoss(params).$promise
            .then(function(data) {
                batchError = 0;

                var profitAndLossArray = function (data, batchPosition) {
                    if (data && data.data) {
                        if (batchPosition == 0) {
                            dataArray.push(['Profit & Loss']);
                            dataArray.push(['PT Etobee Teknologi Indonesia']);
                            dataArray.push(['For '+ moment(params.start).format('MMMM YYYY') +' - '+ moment(params.end).format('MMMM YYYY')]);
                            dataArray.push(['']);
                            dataArray.push(['']);
                            dataArray.push(['']);
                            dataArray.push(['Income']);
                            angular.forEach(data.data.income, function (val, key) {
                                dataArray.push([val.displayName]);
                            });
                            dataArray.push(['Total Income']);
                            dataArray.push(['']);
                            dataArray.push(['Less Cost of Sales']);
                            angular.forEach(data.data.cost, function (val, key) {
                                dataArray.push([val.displayName]);
                            });
                            dataArray.push(['Total Cost of Sales']);
                            dataArray.push(['']);
                            dataArray.push(['Gross Profit']);
                        }

                        var indexDate = 4;
                        var indexTotalIncome = indexDate + 3 + data.data.income.length;
                        var indexTotalCost = indexTotalIncome + 3 + data.data.cost.length;
                        var indexGrossProfit = dataArray.length - 1;

                        dataArray[indexDate].push(data.data.date);
                        angular.forEach(dataArray, function (val, key) {
                            var income = lodash.find(data.data.income, {displayName: val[0]});
                            var cost = lodash.find(data.data.cost, {displayName: val[0]});
                            if (income) {
                                val.push(parseInt(income.value));
                            }
                            if (cost) {
                                val.push(parseInt(cost.value));
                            }
                        });
                        dataArray[indexTotalIncome].push(data.data.totalIncome);
                        dataArray[indexTotalCost].push(data.data.totalCost);
                        dataArray[indexGrossProfit].push(data.data.totalIncome - data.data.totalCost);
                    }
                };

                successFunction(data, '', profitAndLossArray);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'orderSummary') {
            $scope.isExportTypeExist = true;
            customInit(function () {
                var getAbsoulteMonths = function (momentDate) {
                    var months = Number(momentDate.format("MM"));
                    var years = Number(momentDate.format("YYYY"));
                    return months + (years * 12);
                }

                var start = moment(params.start);
                var end = moment(params.end);
                var diff = Math.ceil(getAbsoulteMonths(end) - getAbsoulteMonths(start)) + 1;

                limit = 1;
                batch = diff;
                maxExport = diff;
                $scope.progress.maxExport = diff;

                params.limit = limit;
                params.month = parseInt(moment(params.end).format('M'));
                params.year = parseInt(moment(params.end).format('YYYY'));
            });

            if (offset) {
                params.month = params.month - limit;
                if (params.month < 1) {
                    params.year = (params.month == 0) ? params.year - 1 : params.year;
                    params.month = 12 - params.month;
                }
            }

            return Services2.exportOrderSummary(params).$promise
            .then(function(data) {
                batchError = 0;

                var orderSummaryArray = function (data, batchPosition) {
                    if (data && data.data) {
                        if (batchPosition == 0) {
                            dataArray.push(['Order Summary']);
                            dataArray.push(['PT Etobee Teknologi Indonesia']);
                            dataArray.push(['For '+ moment(params.start).format('MMMM YYYY') +' - '+ moment(params.end).format('MMMM YYYY')]);
                            dataArray.push(['']);
                            dataArray.push(['# Order']);
                            dataArray.push(['Total Order']);
                            angular.forEach(data.data.result, function (val, key) {
                                dataArray.push([val.displayName]);
                                angular.forEach(val.data, function (val, key) {
                                    dataArray.push([val.displayName]);
                                });
                                dataArray.push(['']);
                            });
                        }

                        var indexDate = 4;
                        var indexTotalOrder = indexDate + 1;
                        var rowContent = indexTotalOrder;

                        dataArray[indexDate].push(data.data.date);
                        dataArray[indexTotalOrder].push(data.data.totalOrder);

                        angular.forEach(data.data.result, function (val, key) {
                            rowContent++;
                            dataArray[rowContent].push(['']);
                            angular.forEach(val.data, function (val, key) {
                                rowContent++;
                                dataArray[rowContent].push(val.value);
                            });
                            rowContent++;
                            dataArray[rowContent].push(['']);
                        });
                    }
                };

                successFunction(data, '', orderSummaryArray);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'dailyDistance') {
            $scope.isExportTypeExist = true;
            customInit(function () {
                var start = moment(params.start);
                var end = moment(params.end);
                var diff = Math.ceil(end.diff(start, 'days')) + 1;

                limit = 1;
                batch = diff;
                maxExport = diff;
                $scope.progress.maxExport = diff;

                params.limit = limit;
                params.date = moment(start).toDate();
            });

            if (offset) {
                var date = moment(params.date);
                params.date = moment(date.add(limit, 'days')).toDate();
            }

            return Services2.exportDailyDistance(params).$promise
            .then(function(data) {
                var indexDate = 4;
                var rowContent = indexDate + 1;

                batchError = 0;

                var findRowFromFleetAndDriver = function (companyName, driverName) {
                    var result = false;
                    angular.forEach(dataArray, function (val, key) {
                        if (key > indexDate) {
                            if (dataArray[key][0] == companyName && dataArray[key][1] == driverName) {
                                result = {};
                                result.row = key;
                                result.column = offset;
                            }
                        }
                    });
                    return result;
                }

                var dailyDistanceArray = function (data, batchPosition) {
                    if (data && data.data) {
                        if (batchPosition == 0) {
                            dataArray.push(['Daily Distance']);
                            dataArray.push(['PT Etobee Teknologi Indonesia']);
                            dataArray.push(['For '+ moment(params.start).format('DD MMMM YYYY') +' - '+ moment(params.end).format('DD MMMM YYYY')]);
                            dataArray.push(['']);
                            dataArray.push(['FleetManager', 'DriverName']);
                        }

                        dataArray[indexDate].push(data.data.date);

                        angular.forEach(data.data.result, function (val, key) {
                            var findRowColumn = findRowFromFleetAndDriver(val.CompanyName, val.DriverName);
                            var newRowContent = [];

                            if (!findRowColumn) {
                                newRowContent.push(val.CompanyName);
                                newRowContent.push(val.DriverName);
                                for (var i=0; i < offset; i++) {
                                    newRowContent.push('');
                                }
                                newRowContent.push(val.Distance);
                                dataArray.push(newRowContent);
                            }

                            if (findRowColumn) {
                                var emptyColumn = (offset + 2) - dataArray[findRowColumn.row].length;
                                for (var i=0; i < emptyColumn; i++) {
                                    dataArray[findRowColumn.row].push('');
                                }
                                dataArray[findRowColumn.row].push(val.Distance);
                            }
                        });
                    }
                };

                successFunction(data, '', dailyDistanceArray);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

        if (type == 'dailyWebstore') {
            $scope.isExportTypeExist = true;
            customInit(function () {
                var start = moment(params.start);
                var end = moment(params.end);
                var diff = Math.ceil(end.diff(start, 'days')) + 1;

                limit = 1;
                batch = diff;
                maxExport = diff;
                $scope.progress.maxExport = diff;

                params.limit = limit;
                params.pickupDate = moment(start).toDate();
            });

            if (offset) {
                var date = moment(params.pickupDate);
                params.pickupDate = moment(date.add(limit, 'days')).toDate();
            }

            return Services2.exportWebstoreTotalOrder(params).$promise
            .then(function(data) {
                var indexDate = 4;
                var rowContent = indexDate + 1;

                batchError = 0;

                var findRowFromWebstoreName = function (webstore) {
                    var result = false;
                    angular.forEach(dataArray, function (val, key) {
                        if (key > indexDate) {
                            if (dataArray[key][0] == webstore) {
                                result = {};
                                result.row = key;
                                result.column = offset;
                            }
                        }
                    });
                    return result;
                }

                var dailyWebstoreArray = function (data, batchPosition) {
                    if (data && data.data) {
                        if (batchPosition == 0) {
                            dataArray.push(['Daily Webstore Total Order']);
                            dataArray.push(['PT Etobee Teknologi Indonesia']);
                            dataArray.push(['For '+ moment(params.start).format('DD MMMM YYYY') +' - '+ moment(params.end).format('DD MMMM YYYY')]);
                            dataArray.push(['']);
                            dataArray.push(['Webstore']);
                        }

                        dataArray[indexDate].push(data.data.date);

                        angular.forEach(data.data.result, function (val, key) {
                            var findRowColumn = findRowFromWebstoreName(val.Name);
                            var newRowContent = [];

                            if (!findRowColumn) {
                                newRowContent.push(val.Name);
                                for (var i=0; i < offset; i++) {
                                    newRowContent.push(0);
                                }
                                newRowContent.push(val.TotalOrder);
                                dataArray.push(newRowContent);
                            }

                            if (findRowColumn) {
                                var emptyColumn = (offset + 2) - dataArray[findRowColumn.row].length;
                                for (var i=0; i < emptyColumn; i++) {
                                    dataArray[findRowColumn.row].push(0);
                                }
                                dataArray[findRowColumn.row].push(val.Distance);
                            }
                        });
                    }

                    angular.forEach(dataArray, function (val, key) {
                        if (key > indexDate) {
                            if (!dataArray[key][offset + 1]) {
                                dataArray[key][offset + 1] = 0;
                            }
                        }
                    });
                };

                successFunction(data, '', dailyWebstoreArray);
            }).catch(function (e) {
                batchError++;
                if (batchError > limitError) {
                    return errorFunction(e.data.error.message);
                }
                getDataJson(offset);
            });
        }

    }

    var fetchDataJson = function (type) {
        /** initialize **/
        params.limit = limit;
        params.offset = 0;

        lodash.map(params, function (value, index) {
            var dateMoment = moment(value);
            if (dateMoment.isValid() && !isFinite(value)) {
                params[index] = new Date(value);
            }
        });

        getDataJson();
    };

    var buildExcel = function(type) {
        $scope.progress.message = 'building Excel File';
        var result = {};
        result.fileName = 'export_'+ $filter('date')(new Date(), 'dd-MM-yyyy HH:mm:ss').replace(':', '-');
        result.sheetName = (sheetName) ? sheetName : type;
        result.dataExcel = dataArray;

        $rootScope.$emit('downloadExcel', result);
    };

});