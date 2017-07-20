'use strict';

angular.module('adminApp')
    .factory('Printer', ['$rootScope', '$compile', '$http', '$timeout', '$q',
        function ($rootScope, $compile, $http, $timeout, $q) {
            var printHtml = function (html, setting) {
                var deferred = $q.defer();
                var title = '';
                var pageSize = '';
                var cssURL = '';
                if (setting) {
                    if (setting.title) {
                        title = setting.title;
                    }
                    if (setting.paperSize) {
                        pageSize += setting.paperSize;
                    }
                    if (setting.paperOrientation) {
                        pageSize += ' ' + setting.paperOrientation;
                    }
                    if (setting.cssURL) {
                        setting.cssURL.forEach(function (val, key) {
                            cssURL += '<link rel="stylesheet" href="'+ val +'">';
                        });
                    }
                }

                var htmlContent = "<!DOCTYPE html>" +
                        "<html moznomarginboxes mozdisallowselectionprint>" +
                            '<head>' +
                                '<meta charset="utf-8">' +
                                '<title>'+ title +'</title>' +
                                cssURL +
                                '<style>' +
                                   'body { -webkit-print-color-adjust: exact; }' +
                                   '@page { size: '+ pageSize +' }' +
                                '</style>' +
                            '</head>' +
                            '<body class="' + pageSize + '" onload="window.print()">' +
                                html +
                            '</body>' +
                        "</html>";

                deferred.resolve();

                var popupWin = window.open('', '_blank', 'width=1000, height=600');
                    popupWin.document.open();
                    popupWin.document.write(htmlContent);
                    popupWin.document.close();
                return deferred.promise;
            };

            var openNewWindow = function (html) {
                var newWindow = window.open("printTest.html");
                newWindow.addEventListener('load', function () {
                    $(newWindow.document.body).html(html);
                }, false);
            };

            var print = function (templateUrl, data) {
                $rootScope.isBeingPrinted = true;
                $http.get(templateUrl).then(function (templateData) {
                    var template = templateData.data;
                    var printScope = $rootScope.$new();
                    angular.extend(printScope, data);
                    var element = $compile($('<div>' + template + '</div>'))(printScope);
                    var renderAndPrintPromise = $q.defer();
                    var waitForRenderAndPrint = function () {
                        if (printScope.$$phase || $http.pendingRequests.length) {
                            $timeout(waitForRenderAndPrint, 1000);
                        } else {
                        // Replace printHtml with openNewWindow for debugging
                            printHtml(element.html(), data.setting).then(function () {
                                $rootScope.isBeingPrinted = false;
                                renderAndPrintPromise.resolve();
                            });
                            printScope.$destroy();
                        }
                        return renderAndPrintPromise.promise;
                    };
                    waitForRenderAndPrint();
                });
            };

            var printFromScope = function (templateUrl, scope, afterPrint) {
                $rootScope.isBeingPrinted = true;
                $http.get(templateUrl).then(function (response) {
                    var template = response.data;
                    var printScope = scope;
                    var element = $compile($('<div>' + template + '</div>'))(printScope);
                    var renderAndPrintPromise = $q.defer();
                    var waitForRenderAndPrint = function () {
                        if (printScope.$$phase || $http.pendingRequests.length) {
                            $timeout(waitForRenderAndPrint);
                        } else {
                            printHtml(element.html(), scope.setting).then(function () {
                                $rootScope.isBeingPrinted = false;
                                if (afterPrint) {
                                    afterPrint();
                                }
                                renderAndPrintPromise.resolve();
                            });
                        }
                        return renderAndPrintPromise.promise;
                    };
                    waitForRenderAndPrint();
                });
            };

            return {
                print: print,
                printFromScope: printFromScope
            };
        }]);