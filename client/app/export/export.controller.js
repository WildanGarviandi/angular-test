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
    });

    var dataArray = [];
    var type = $location.search()['exportType'];
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
    $scope.progress = {};
    $scope.progress.maxExport = maxExport;
    $scope.progress.export = 0;
    $scope.progress.percentage = 0;
    $scope.progress.message = 'initialize ...';

    var buildArray = function (data, batchPosition) {
        if (data && data.data && data.data.length) {
            if (batchPosition == 0) {
                var header = Object.keys(data.data[0]);
                dataArray.push(header);
            }

            angular.forEach(data.data, function (val, key) {
                var datas = Object.values(val);
                dataArray.push(datas);
            });
        } else {
            return buildExcel(type);
        }
    }

    var successFunction = function (data) {
        $scope.progress.export += params.limit;
        $scope.progress.percentage = ($scope.progress.export / maxExport) * 100;

        buildArray(data, batchPosition);

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
        result.sheetName = type;
        result.dataExcel = dataArray;

        $rootScope.$emit('downloadExcel', result);
    };

    fetchDataJson(type);
});