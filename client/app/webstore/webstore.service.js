angular.module('adminApp')
    .factory('Webstores', function($resource, config) {
    return $resource(config.url + ':module/:id', {
        id: '@_id'
    }, {
        getWebstore: {
            method: 'GET',
            params: {
                module: 'webstore',
                limit: '@limit',
                offset: '@offset'
            }
        },
        getWebstoreDetails: {
            method: 'GET',
            params: {
                module: 'webstore',
            }
        },
        createWebstore: {
            method: 'POST',
            params: {
                module: 'webstore',
            }
        },
        updateWebstore: {
            method: 'POST',
            transformRequest: function(data) {
              return JSON.stringify(data.webstore);
            },
            params: {
                module: 'webstore'
            },
        },
        verifyWebstore: {
            method: 'POST',
            url: config.url + ':module/:id/verify',
            params: {
                module: 'webstore',
            },
        },
    });
});
