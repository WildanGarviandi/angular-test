'use strict';

angular.module('adminApp')
    .filter('localizenumber',
    function(config) {
        var decimalSeparator = config.decimalSeparator;
        var thousandSeparator = (decimalSeparator === ',') ? '.' : ',';
        return function(input) {
            if (!input) {
                return null;
            }

            var output = input.toString().replace(/\./g, ';');
            output = output.replace(/\,/g, thousandSeparator);
            output = output.replace(/\;/g, decimalSeparator);
            return output;
        };
    });