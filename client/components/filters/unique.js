'use strict';

angular.module('adminApp')
    .filter('unique',
    function(config) {
        return function(collection, keyname) {
            var output = [], 
                keys = [];

            angular.forEach(collection, function(item) {
                var key = item[keyname];
                if(keys.indexOf(key) === -1) {
                    keys.push(key); 
                    output.push(item);
                }
            });

            return output;
       };
    });