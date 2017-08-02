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
        } else {
            return buildExcel(type);
        }
    }

    var forceBuildExcel = function (data, template) {
        $scope.progress.export = maxExport;
        $scope.progress.percentage = ($scope.progress.export / maxExport) * 100;

        buildArray(data, batchPosition, template);

        return buildExcel(type);
    }

    var successFunction = function (data, template) {
        $scope.progress.export += params.limit;
        $scope.progress.percentage = ($scope.progress.export / maxExport) * 100;

        buildArray(data, batchPosition, template);

        batchPosition++;

        if (batchPosition < batch) {
            getDataJson(params.limit * batchPosition);
        } else {
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