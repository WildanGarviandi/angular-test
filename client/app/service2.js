'use strict';

var url = 'http://localhost:3001/v2/admin/';
angular.module('adminApp')
    .factory('Services2', function($resource) {
    return $resource(url + ':module/:submodule/:controller/:action/:id', {
        id: '@_id'
    }, {
        getTrip: {
            method: 'GET',
            params: {
                module: 'trip'
            },
        },
        getTripDetails: {
            method: 'GET',
            params: {
                module: 'trip',
                id: null
            },
        },
        getStatus: {
            method: 'GET',
            params: {
                module: 'status'
            },
        },
    });
});
