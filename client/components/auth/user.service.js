'use strict';

angular.module('bookingApp')
  .factory('User', function ($resource) {
    return $resource('/:module/:submodule/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          module: 'api',
          submodule: 'users',
          controller:'password'
        }
      },
      get : {
        method: 'GET',
        params: {
          module: 'webapi',
          controller:'me'
        }
      }
	  });
  });
