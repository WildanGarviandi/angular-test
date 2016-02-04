'use strict';

angular.module('adminApp')
    .factory('Services', function($resource) {
    return $resource('/:module/:submodule/:controller/:action/:id', {
        id: '@_id'
    }, {
        get: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'show'
            },
        },
        getAll: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'all'
            },
        },
        getOne: {
            method: 'GET',
            params: {
                module: 'hubs',
                controller: 'one'
            },
        },
        createHub: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'create'
            },
        },
        updateHub: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'update'
            },
        },
        deleteHub: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'delete',
                id: null
            },
        },
        showCompanies: {
            method: 'GET',
            params: {
                module: 'company',
                controller: 'all'
            },
        },
        showLogisticPrices: {
            method: 'POST',
            params: {
                module: 'price',
                controller: 'logistic'
            },
        },
        savePrices: {
            method: 'POST',
            params: {
                module: 'price',
                controller: 'saveLogistic'
            },
        },
        getCountries: {
            method: 'GET',
            params: {
                module: 'location',
                controller: 'country'
            },
        },
        getStates: {
            method: 'GET',
            params: {
                module: 'location',
                controller: 'state'
            },
        },
        getCities: {
            method: 'GET',
            params: {
                module: 'location',
                controller: 'city'
            },
        },
    });
});
