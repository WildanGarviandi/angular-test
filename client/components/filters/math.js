'use strict';

angular.module('adminApp')
    .filter('ceil',
    function(config) {
        return function (value) {
            return Math.ceil(value);
        };
    });

angular.module('adminApp')
    .filter('floor',
    function(config) {
        return function (value) {
            return Math.floor(value);
        };
    });

angular.module('adminApp')
    .filter('round',
    function(config) {
        return function (value) {
            return Math.round(value);
        };
    });