'use strict';

angular.module('adminApp')
    .factory('Services2', function($resource, config) {
    return $resource(config.url + ':module/:submodule/:controller/:action/:id', {
        id: '@_id'
    }, {
        getHubs: {
            method: 'GET',
            params: {
                module: 'hub'
            },
        },
        getOneHub: {
            method: 'GET',
            params: {
                module: 'hub',
                id: null
            },
        },
        createHub: {
            method: 'POST',
            params: {
                module: 'hub',
            },
        },
        updateHub: {
            method: 'POST',
            params: {
                module: 'hub',
                id: null
            },
        },
        deleteHub: {
            method: 'DELETE',
            params: {
                module: 'hub',
                id: null
            },
        },
        saveZipcodes: {
            method: 'POST',
            params: {
                module: 'hub',
                controller: 'saveZipcodes',
                id: null
            },
        },
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
