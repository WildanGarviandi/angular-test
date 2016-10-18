'use strict';

angular.module('adminApp')
.directive('phoneValidate', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            var regex = new RegExp('^[+]?(\\d{3}(-| )?\\d{3}(-| )?\\d{4}|\\d{5,12}|}|[(]\\d{3}[)](-| )?' + 
                                    '\\d{3}(-| )?\\d{4})$');

            elem.bind('keypress', function(event) {
                if(event.keyCode === 32) {
                    event.preventDefault();
                }
            });

            // Validate and also prevent non number character
            ctrl.$parsers.unshift(function (val) {
                var valid = regex.test(val);
                ctrl.$setValidity('phoneValidate', valid);

                if (angular.isUndefined(val) || val === null) {
                    val = '';
                }
                if (typeof val === 'number') {
                    val = val.toString();
                }

                var clean = val.replace(/[^-0-9\.]/g, '');
                var negativeCheck = clean.split('-');
                var decimalCheck = clean.split('.');
                if(!angular.isUndefined(negativeCheck[1])) {
                    negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                    clean =negativeCheck[0] + '-' + negativeCheck[1];
                    if(negativeCheck[0].length > 0) {
                            clean =negativeCheck[0];
                    }
                }
                    
                if(!angular.isUndefined(decimalCheck[1])) {
                    decimalCheck[1] = decimalCheck[1].slice(0,2);
                    clean =decimalCheck[0] + '.' + decimalCheck[1];
                }

                if (val !== clean) {
                    ctrl.$setViewValue(clean);
                    ctrl.$render();
                }

                return valid ? clean : undefined;
            });

            ctrl.$formatters.unshift(function (val) {
                ctrl.$setValidity('phoneValidate', regex.test(val));
                return val;
            });
        }
    };
});