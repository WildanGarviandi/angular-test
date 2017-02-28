'use strict';

angular.module('adminApp')
    .directive('selectWithChecklist', () => ({
        templateUrl: 'components/directives/select/select-with-checklist.html',
        restrict: 'E',
        require: '^ngModel',
        scope: {
                items: '=',
                uniqueField: '@',
                textField: '@',
                valueField: '@',
                ngModel:'='
            },
        link: function (scope, element, attrs, ngModelCtrl) {
            //added a watch to update the text of the multiselect
            scope.$watch('ngModel',function(v){
                scope.setLabel();
            }, true);

            var uniqueField = scope.uniqueField.toString().trim();
            var valueField = scope.valueField.toString().trim();
            var textField = scope.textField.toString().trim();
            var modelIsValid = false;
            var selectedItemIsValid = false;
            
            scope.checkModelValidity = function (items) {
                if (typeof(items) == "undefined" || !items) return false;
                if (items.length < 1) return false;
                return true;
            };
            modelIsValid = scope.checkModelValidity(scope.ngModel);
            scope.setFormValidity = function () {
                if (typeof (attrs.required) != "undefined") {
                    return modelIsValid;//modelIsValid must be set before we setFormValidity
                }
                return true;
            };
            ngModelCtrl.$setValidity('noItemsSet!', scope.setFormValidity());
            scope.checkSelectedItemValidity = function (item) {
                if (!item) return false;
                if (!item[valueField]) return false;
                if (!item[valueField].toString().trim()) return false;
                return true;
            };
            
            scope.getItemName = function (item) {
                return item[textField];
            };
            

            scope.setLabel = function() {
                if (typeof (scope.ngModel) =="undefined" || !scope.ngModel || scope.ngModel.length < 1) {
                    
                        scope.currentItemLabel = attrs.defaultText;
                   
                } else {
                    var allItemsString = '';
                    var selectedItemsCount=scope.ngModel.length;
                    if(selectedItemsCount < 2){
                        angular.forEach(scope.ngModel, function (item) {
                            allItemsString += item[textField].toString() + ', ';
                        });
                    }else{
                        allItemsString = selectedItemsCount+" selected";
                    }
                    scope.currentItemLabel = allItemsString;
                }
            };
            scope.setLabel();
            scope.setCheckboxChecked = function (_item) {
                var found = false;
                angular.forEach(scope.ngModel, function (item) {
                    if (!found) {
                        if (_item && _item[valueField] && item[valueField]) {
                            if (_item[valueField].toString() === item[valueField].toString()) {
                                found = true;
                            }
                        }
                    }
                });
                return found;
            };
            scope.selectVal = function (_item) {
                var found = false;
                if (_item) {
                    if (typeof(scope.ngModel) != "undefined" && scope.ngModel) {
                        for (var i = 0; i < scope.ngModel.length; i++) {
                            if (!found) {
                                if (_item[valueField].toString() === scope.ngModel[i][valueField].toString()) {
                                    found = true;
                                    var index = scope.ngModel.indexOf(scope.ngModel[i]);
                                    scope.ngModel.splice(index, 1);
                                }
                            }
                        }
                    } else {
                        scope.ngModel = [];
                    }
                    if (!found) {
                        scope.ngModel.push(_item);
                    }

                    scope.selectAll = false;
                    if (scope.ngModel.length == scope.itemsAfterSearch.length) {
                        scope.selectAll = true;
                    }
                } else {
                    for (var i = 0; i < scope.itemsAfterSearch.length; i++) {
                        if ((i == 0)) {
                            if (scope.ngModel.length > 0 && (scope.itemsAfterSearch.length > scope.ngModel.length)) {
                                scope.ngModel = [];
                                scope.ngModel.push(scope.itemsAfterSearch[i]);
                            } else if (scope.ngModel.length >= scope.itemsAfterSearch.length) {
                                scope.selectAll = false;
                                scope.ngModel = [];
                                i = scope.itemsAfterSearch.length;
                            } else {
                                scope.selectAll = true;
                                scope.ngModel.push(scope.itemsAfterSearch[i]);
                            }
                        } else {
                            scope.selectAll = true;
                            scope.ngModel.push(scope.itemsAfterSearch[i]);
                        }
                    }
                }

                modelIsValid = scope.checkModelValidity(scope.ngModel);
                selectedItemIsValid = scope.checkSelectedItemValidity(_item);
                ngModelCtrl.$setValidity('noItemsSet!', scope.setFormValidity() && selectedItemIsValid);
                scope.setLabel();
                ngModelCtrl.$setViewValue(scope.ngModel);
            };
            
            scope.cancelClose = function($event) {
                $event.stopPropagation();
            };
        }
    }));