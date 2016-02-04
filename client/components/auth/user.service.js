'use strict';

angular.module('adminApp')
    .factory('User', function ($resource) {
        return $resource('/:module/:submodule/:id/:controller', {
            id: '@_id'
        },
        {
            get : {
                method: 'GET',
                params: {
                    module: 'user',
                    controller:'me'
                }
            }
        });
    });
