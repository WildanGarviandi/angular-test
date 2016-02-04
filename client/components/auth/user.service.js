'use strict';

angular.module('adminApp')
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
          module: 'user',
          controller:'me'
        }
      }
	  });
  });
