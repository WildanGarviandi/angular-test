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
            method: 'POST',
            params: {
                module: 'hub',
                controller: 'delete',
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
        getCities: {
            method: 'GET',
            params: {
                module: 'city'
            },
        },
        getOneCity: {
            method: 'GET',
            params: {
                module: 'city',
                id: null
            },
        },
        createCity: {
            method: 'POST',
            params: {
                module: 'city',
            },
        },
        updateCity: {
            method: 'POST',
            params: {
                module: 'city',
                id: null
            },
        },
        deleteCity: {
            method: 'POST',
            params: {
                module: 'city',
                controller: 'delete',
                id: null
            },
        },
        getDrivers: {
            method: 'GET',
            params: {
                module: 'driver'
            },
        },
        getOneDriver: {
            method: 'GET',
            params: {
                module: 'driver',
                id: null
            },
        },
        updateDriver: {
            method: 'POST',
            params: {
                module: 'driver',
                id: null
            },
        },
        getUserStatus: {
            method: 'GET',
            params: {
                module: 'status',
                controller: 'user',
            },
        },
    });
});
