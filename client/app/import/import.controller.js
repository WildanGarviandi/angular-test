'use strict';

angular.module('adminApp')
    .controller('ImportCtrl', 
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
            config,
            ngDialog,
            Webstores,
            Upload,
            $q,
            SweetAlert,
            $cookies,
            $timeout,
            $socket,
            hotRegisterer
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    var params = {};

    var initScope = function () {
        $scope.table = {};
        $scope.table.settings = {};
        $scope.table.settings.afterInit = afterInit;
        $scope.table.settings.afterChange = afterChange;
        $scope.table.settings.beforeChange = beforeChange;
        $scope.table.columns = [];

        $scope.import = {};
        $scope.import.isOnProcess = false;
        $scope.import.processMessage = '';
        $scope.import.isExcelValid = false;
        $scope.import.template = '';
        $scope.import.isHaveParam = false;
        $scope.import.modal = '';
        $scope.import.customValidator = [];
        $scope.import.isUsingSocket = false;
        $scope.import.progress = 0;

        $scope.temp = {};
    }
    initScope();

    params.temp = {};
    params.fromUrl = lodash.assign({}, $location.search());
    delete params.fromUrl['importType'];

    /* Import Type for Import Orders, Import Delivery Attempts, Mark as Delivered
     * orders, attempts, delivered
     */
    $scope.importTypes = [
        {
            key: 'Mark as Delivered',
            value: 'delivered'
        }
    ];

    $scope.importType = {
        key: 'Choose import type ...',
        value: 0
    };

    // Here, model and param have same naming format for choose import type
    var pickedImportType = {
        'ImportType': {
            model: 'importType',
            pick: 'value',
            collection: 'importTypes'
        }
    };

    lodash.each(pickedImportType, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;
            getImportType();
        };
    });

    function getImportType () {
        lodash.each(pickedImportType, function (val) {
            var value = $location.search()[val.model] || $scope[val.model][val.pick];
            var findObject = {};
            findObject[val.pick] = value;
            $scope[val.model] = lodash.find($scope[val.collection], findObject);
            if (val.model == 'importType') {
                $socket.disconnect();
                initScope();
                buildImportType(value);
            }
        });
    }

    /* call modal with default template
     * @param  {header} html - to be randerer in html
     * @param  {isUsingTemplate} boolean - to be randerer in html
     * @param  {body} html - to be randerer in html
     * @param  {footer} html - to be randerer in html
     * @param  {text} custom text - custom text to be randerer
     * @param  {onSubmit} function - to be call on submit
     * @return void
     */
    var generateModal = function (header, isUsingTemplate, body, text, onSubmit) {
        $scope.modal = {};
        $scope.modal.text = {};
        $scope.modal.header = header;
        $scope.modal.isUsingTemplate = isUsingTemplate;
        $scope.modal.body = body;
        $scope.modal.onSubmit = onSubmit;
        $scope.modal.text.submit = text.submit;
        $scope.modal.close = function () {
            ngDialog.close();
        };
    }

    $scope.openModal = function (template) {
        if (!$scope.import.isExcelValid) {
            return SweetAlert.swal({
                title: 'No File Imported',
                text: 'Please Choose File or Create New Row',
                type: 'error'
            });
        }

        return ngDialog.open({
            template: template,
            scope: $scope,
            className: 'ngdialog-theme-default no-padding import-modal'
        });
    }

    /* start responsive table */
    $scope.style = {};
    var windowSize = function () {
        var onResize = function (h_window, h_body) {
            $scope.style.importArea = '';
            $scope.style.importTable = h_body;
        }

        var h_window = $(window).height() - 10;
        var h_header = $('#header-area').height();
        var h_footer = $('#footer-area').height();
        var h_body = h_window - (h_header + h_footer);

        onResize(h_window, h_body);
        $(window).resize(function(){
            $scope.$apply(function(){
                h_window = $(window).height() - 5;
                h_header = $('#header-area').height();
                h_footer = $('#footer-area').height();
                h_body = h_window - (h_header + h_footer);
                onResize(h_window, h_body);
            });
        });
    }
    
    windowSize();
    /* end responsive table */

    var templateValidator = function (templateURL, dataExcel) {
        var deferred = $q.defer();
        var isValid = false;
        deferred.notify('processing data');

        readExcelTemplate(templateURL).then(function (data){
            var differenceHeader = lodash.difference(dataExcel.headerNames, data.headerNames);

            isValid = lodash.isEqual(data.headerNames, dataExcel.headerNames);
            if (!isValid) {
                deferred.reject('please use valid template');
            }

            deferred.resolve(dataExcel);
        });

        return deferred.promise;
    }

    var emailValidator = function (value, callback) {
        setTimeout(function(){
            if (/.+@.+/.test(value)) {
                callback(true);
            } else {
                callback(false);
            }
        }, 1000);
    };

    var processingLoop = function (limit, funcToExecute, callbackOnFinish) {
        var data = $scope.temp.data;
        var startRow = $scope.import.progress;
        var endRow = startRow + limit;

        funcToExecute(data.slice(startRow, endRow))
        .then(function() {
            $scope.import.progress = endRow;

            if ($scope.import.progress < $scope.import.max) {
                processingLoop(limit, funcToExecute, callbackOnFinish);
            } else {
                return callbackOnFinish();
            }
        });
    }

    var loopWithLimit = function (limit, funcToExecute, callbackOnFinish) {
        var promises = [];
        $scope.import.progress = 0;
        $scope.import.max = $scope.temp.data.length;
        
        return processingLoop(limit, funcToExecute, callbackOnFinish);
    }

    /* routing import type */
    var buildImportType = function (type) {
        $scope.import.customValidator = [];
        $scope.import.template = '';
        $scope.import.uniqKey = '';
        loadJson('');

        switch (type) {
            case 'orders':
                $scope.import.uniqKey = 'WebOrderID';
                $scope.import.template = '../../assets/template/templateImportOrders.xlsx';
                $scope.import.isUsingSocket = true;
                $scope.import.isHaveParam = true;
                $scope.import.onSubmit = function () {

                };
                $socket.connect();
                break;
            case 'attempts':
                $scope.import.uniqKey = 'EDSNumber';
                $scope.import.template = '../../assets/template/importUserOrderAttempt.xlsx';
                $scope.import.isUsingSocket = false;
                $scope.import.isHaveParam = false;
                $scope.import.onSubmit = function () {

                };
                $scope.import.modal = generateModal('Import Delivery Attempts', true, 'app/import/optionImportOrders.html', {submit: 'Submit'}, $scope.import.onSubmit);
                $scope.import.customValidator = [
                    {
                        header: 'FirstAttemptReason',
                        format: {
                            type: 'dropdown',
                            source: ['BAD_ADDRESS', 'CONSIGNEE_NOT_AROUND', 'CONSIGNEE_REFUSED_TO_ACCEPT', 
                            'CONSIGNEE_CANNOT_BE_CONTACTED', 'CONSIGNEE_CHANGE_MIND', 'CONSIGNEE_DOES_NOT_HAVE_ENOUGH_CASH', 
                            'STUFF_OR_BOX_IS_BROKEN', 'STUFF_DOES_NOT_MATCH_SPECIFICATION', 'DRIVER_ARRIVED_TOO_LATE', 
                            'COD_MISMATCH', 'MANUAL_PROCESS', 'OUT_OF_COVERAGE']
                        }
                    },
                    {
                        header: 'FirstAttemptDate',
                        format: {
                            type: 'date',
                            dateFormat: 'MM/DD/YYYY'
                        }
                    },
                    {
                        header: 'SecondAttemptReason',
                        format: {
                            type: 'dropdown',
                            source: ['BAD_ADDRESS', 'CONSIGNEE_NOT_AROUND', 'CONSIGNEE_REFUSED_TO_ACCEPT', 
                            'CONSIGNEE_CANNOT_BE_CONTACTED', 'CONSIGNEE_CHANGE_MIND', 'CONSIGNEE_DOES_NOT_HAVE_ENOUGH_CASH', 
                            'STUFF_OR_BOX_IS_BROKEN', 'STUFF_DOES_NOT_MATCH_SPECIFICATION', 'DRIVER_ARRIVED_TOO_LATE', 
                            'COD_MISMATCH', 'MANUAL_PROCESS', 'OUT_OF_COVERAGE']
                        }
                    },
                    {
                        header: 'SecondAttemptDate',
                        format: {
                            type: 'date',
                            dateFormat: 'MM/DD/YYYY'
                        }
                    }
                ];
                break;
            case 'delivered':
                $scope.import.uniqKey = 'EDSNumber';
                $scope.import.template = '../../assets/template/importMarkAsDelivered.xlsx';
                $scope.import.isUsingSocket = false;
                $scope.import.isHaveParam = false;
                $scope.import.onSubmit = function () {
                    ngDialog.close();
                    $scope.import.isOnProcess = true;
                    var commentsPlugin = $scope.hotInstance.getPlugin('comments');
                    if ($scope.temp.error) {
                        lodash.forEach($scope.temp.error, function (error) {
                            commentsPlugin.removeCommentAtCell(error.row, error.column);
                        });
                    }

                    $scope.temp.data = lodash.filter($scope.table.data, function(data) {
                        var check = lodash.keys(data).every(function(key) {
                            return data[key] == '';
                        });

                        if (!check) {
                            return data;
                        }
                    });

                    $scope.import.info = '';
                    $scope.import.processMessage = 'importing data ...';

                    $scope.temp.listOfSuccess = [];
                    $scope.temp.listOfError = [];
                    $scope.temp.error = [];
                    var limit = 25;
                    var error = '';
                    var bulkMarkAsDelivered = function (data) {
                        $scope.import.info = 'processing ' + $scope.import.progress + ' row from ' + $scope.import.max;

                        var tempData = data;
                        return Services2.bulkMarkAsDelivered({
                            data: data
                        }).$promise.then(function (result) {
                            angular.forEach(tempData, function (v, k) {
                                var temp = lodash.find(result.data, { EDSNumber: v.EDSNumber });
                                if (!temp.status) {
                                    var err = temp.message;
                                    if (temp.message.message) {
                                        err = temp.message.message;
                                    }

                                    var column = $scope.table.headerNames.indexOf('EDSNumber');
                                    var comment = err;
                                    var cellError = {
                                        row: $scope.temp.listOfError.length,
                                        column: column,
                                        comment: comment
                                    };
                                    $scope.temp.error.push(cellError);

                                    $scope.temp.listOfError.push(v);
                                }
                                if (temp.status) {
                                    $scope.temp.listOfSuccess.push(v);
                                }
                            });
                        }).catch(function (e) {
                            error += e.data.error.message;

                            if (e.data.error.message.errorList) {
                                error += e.data.error.message.errorList;
                            }
                        });
                    };

                    loopWithLimit(limit, bulkMarkAsDelivered, function () {
                        $scope.clearSheet();
                        $scope.import.progress = 0;
                        $scope.import.isOnProcess = false;
                        $scope.import.processMessage = 'finish importing';

                        $scope.import.info = 'success ' + $scope.temp.count + ' row imported';
                        if ($scope.temp.listOfError.length) {
                            $scope.import.info = '<span class="text-green">'
                                + ($scope.temp.count - $scope.temp.listOfError.length) 
                                + ' row imported </span>, <span class="text-red">' 
                                + $scope.temp.listOfError.length 
                                + ' row error </span>';
                        }
                        if (error) {
                            $scope.import.info += error;
                        }

                        $scope.temp.listOfSuccess = lodash.difference($scope.temp.data, $scope.temp.listOfError);
                        $scope.table.data = lodash.difference($scope.table.data, $scope.temp.listOfSuccess);
                    });
                };
                $scope.import.listOfError = function () {
                    $scope.table.data = $scope.temp.listOfError;

                    var commentsPlugin = $scope.hotInstance.getPlugin('comments');
                    $scope.hotInstance.loadData($scope.table.data);

                    lodash.forEach($scope.temp.error, function (error) {
                        $scope.hotInstance.getCellMeta(error.row, error.column).comment = error.comment;
                    });

                    commentsPlugin.refreshEditorPosition();
                    $(".htCommentTextArea").attr("disabled","disabled");
                }
                $scope.import.listOfSuccess = function () {
                    $scope.table.data = $scope.temp.listOfSuccess;
                }
                $scope.import.modal = generateModal('Mark as Delivered', false, '<p>Are You Sure Want to Import Now ?</p>', {submit: 'Submit'}, $scope.import.onSubmit);
                $scope.import.customValidator = [
                    {
                        header: 'DropoffTime',
                        format: {
                            type: 'date',
                            dateFormat: 'MM/DD/YYYY HH:mm:ss A',
                            correctFormat: true
                        }
                    }
                ];
                break;
            default:
                break;
        }
    }

    var generateColumns = function (dataExcel) {
        $scope.table.columns = [];
        lodash.forEach($scope.table.headerNames, function (value, key) {
            var obj = {};
            var validator = lodash.find($scope.import.customValidator, {header: value});

            if (validator) {
                obj = validator.format;
            } else {
                obj.type = 'text';
            }

            obj.data = value;
            $scope.table.columns.push(obj);
        });
    }

    var readExcelTemplate = function (url) {
        var url = url;
        return $q(function (resolve) {
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";

            oReq.onload = function(e) {
                var arraybuffer = oReq.response;
                var data = new Uint8Array(arraybuffer);
                var arr = new Array();

                for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                var bstr = arr.join("");

                var result = {};
                    result.response = 'error';

                try {
                    var workbook = XLSX.read(bstr, {type: 'binary'});

                    var headerNames = XLSX.utils.sheet_to_json(
                            workbook.Sheets[workbook.SheetNames[0]],
                            {header: 1}
                    )[0];

                    var data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

                        result.response = 'success';
                        result.headerNames = headerNames;
                        result.data = data;
                        result.count = data.length;

                    if (!data) {
                        result.data = [];
                    }

                    if (data.length < 20) {
                        if (!data.length) {
                            var obj = lodash.reduce(result.headerNames, function(acc, cur, i) {
                                acc[cur] = '';
                                return acc;
                            }, {});
                            result.data.push(obj);
                        }

                        for(var i=0; i <= 18; i++){
                            result.data.push({});
                        }
                    }

                } catch (e) {
                    result.message = e;
                    if (e.message) {
                        result.message = e.message;
                    }
                }

                resolve(result);
            }

            oReq.send();
        });
    }

    var afterInit = function () {
        this.validateCells();
        $scope.hotInstance = this;
        $scope.temp.totalRow = $scope.hotInstance.countRows();
        $scope.temp.emptyRow = $scope.hotInstance.countEmptyRows();
        $scope.temp.count = $scope.temp.totalRow - $scope.temp.emptyRow;
    };

    var afterChange = function (changes) {
        $scope.hotInstance = this;
        $scope.temp.totalRow = $scope.hotInstance.countRows();
        $scope.temp.emptyRow = $scope.hotInstance.countEmptyRows();
        $scope.temp.count = $scope.temp.totalRow - $scope.temp.emptyRow;
    };

    var beforeChange = function (changes, source) {

    };

    var loadJsonAfterImport = function () {
        var dataFailed = lodash.filter($scope.table.data, function(data) {
            if (data[$scope.import.uniqKey]) {
                return data;
            }
        });
        $scope.table.data = dataFailed;
    }

    var addComment = function () {
        var hotInstance = hotRegisterer.getInstance('import-excel');
        var commentsPlugin = hotInstance.getPlugin('comments');

        function getColFromName(name) {
            return $scope.table.headerNames.indexOf(name);
        }

        $scope.table.data.forEach(function (value, index) {
            var findObject = {};
                findObject[$scope.import.uniqKey] = value[$scope.import.uniqKey];
            var row = lodash.findIndex($scope.table.data, findObject);

            Object.keys(value).forEach(function (key) {
                if (key != $scope.import.uniqKey) {
                    var column = getColFromName(key);
                    var comment = value[key];

                    hotInstance.getCellMeta(row, column).comment = comment;
                    commentsPlugin.showAtCell(row, column);
                    commentsPlugin.saveCommentAtCell(row, column);
                }
            });
        });

        $(".htCommentTextArea").attr("disabled","disabled");
    };

    $scope.clearSheet = function () {
        var tempData = [];

        var obj = lodash.reduce($scope.table.headerNames, function(acc, cur, i) {
            acc[cur] = '';
            return acc;
        }, {});

        tempData.push(obj);

        for(var i=0; i <= 18; i++){
            tempData.push({});
        }

        $scope.table.data = tempData;
        $scope.import.info = '';
        return;
    }

    $scope.readExcel = function (url) {
        $scope.import.isOnProcess = true;
        $scope.import.processMessage = 'rendering file ...';
        readExcelTemplate(url).then(function (data){
            $scope.import.isExcelValid = true;
            $scope.import.processMessage = 'file rendered, displaying data';
            loadJson(data);
        });
    }

    $scope.importExcel = function (dataExcel) {
        $scope.import.isOnProcess = true;
        $scope.import.isExcelValid = false;
        $scope.import.processMessage = 'rendering file ...';
        templateValidator($scope.import.template, dataExcel)
        .then(function (data) {
            $scope.import.isExcelValid = true;
            $scope.import.processMessage = 'file rendered, displaying data';
            loadJson(data);
        }, function (error) {
            $scope.import.isOnProcess = false;
            $scope.import.isExcelValid = false;
            $scope.import.processMessage = 'file rendered, excel not valid with our template';
            $scope.import.message = error;
        }, function (onValidation) {
            $scope.import.message = onValidation;
        });
    };

    var loadJson = function (dataExcel) {
        $scope.import.isOnProcess = false;
        $scope.table.headerNames = dataExcel.headerNames;
        $scope.table.data = dataExcel.data;
        generateColumns(dataExcel);
    }

    getImportType();

});