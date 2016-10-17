'use strict';

angular.module('adminApp')
.directive('emailValidate', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            var regex = new RegExp('^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)' + 
                                    '|(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.' + 
                                    '[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$', 'i');

            ctrl.$parsers.unshift(function (val) {
                var valid = regex.test(val);
                ctrl.$setValidity('emailValidate', valid);

                return valid ? val : undefined;
            });

            ctrl.$formatters.unshift(function (val) {
                ctrl.$setValidity('emailValidate', regex.test(val));
                return val;
            });
        }
    };
});