'use strict';

angular.module('adminApp')
.directive("excelToJson", function (lodash) {
    return {
        scope: {
            fromDirectiveFn: '=method'
        },
        link: function ($scope, $element, $attrs) {

            function handleSelect (changeEvent) {
                if (changeEvent.target.files.length) {
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        $scope.$apply(function () {
                            var data = e.target.result;
                            var result = {};
                                result.response = 'error';

                            try {
                                var workbook = XLSX.read(data, {type: 'binary'});

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


                            $scope.fromDirectiveFn(result);

                            $element.val(null);
                        });
                    };

                    reader.readAsBinaryString(changeEvent.target.files[0]);
                }
            }

            $element.on('change', handleSelect);
        }
    };
});