'use strict';

angular.module('bookingApp')
  .factory('Order', function($resource) {
    return $resource('/:module/:submodule/:controller/:action/:id', {
      id: '@_id'
    }, {
      get: {
        method: 'GET',
        params: {
          module: 'webapi',
          controller: 'hub'
        },
      }
    });
  });
