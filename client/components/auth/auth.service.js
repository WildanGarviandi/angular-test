'use strict';

angular.module('adminApp')
    .factory('Auth', function Auth($location, $rootScope, $http, User, $cookies, $q, config) {
        var currentUser = {};
        if ($cookies.get('token')) {
          currentUser = JSON.parse($cookies.get('user'));
        }

        return {

            /**
            * Authenticate user and save token
            *
            * @param  {Object}   user     - login info
            * @param  {Function} callback - optional
            * @return {Promise}
            */
            login: function(user, callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();

                $http.post(config.url + config.endpoints.signIn, {
                    username: user.username,
                    password: user.password
                }).
                success(function(data) {
                    data = data.data.SignIn;
                    $cookies.put('token', data.LoginSessionKey);
                    $cookies.put('user', JSON.stringify(data.User));
                    currentUser = data.User;
                    deferred.resolve(data);
                    return cb();
                }).
                error(function(err) {
                    this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

                return deferred.promise;
            },

            /**
            * Delete access token and user info
            *
            * @param  {Function}
            */
            logout: function() {
                $cookies.remove('token');
                currentUser = {};
            },

            /**
            * Gets all available info on authenticated user
            *
            * @return {Object} user
            */
            getCurrentUser: function() {
                return $q(function (resolve) {
                    resolve(currentUser);
                });
            },

            /**
            * Check if a user is logged in
            *
            * @return {Boolean}
            */
            isLoggedIn: function() {
                return currentUser.hasOwnProperty('role');
            },

            /**
            * Waits for currentUser to resolve before checking if user is logged in
            */
            isLoggedInAsync: function(cb) {
                if ($cookies.get('token')) {
                    cb(true);
                } else {
                    cb(false);
                }
            },

            /**
            * Check if a user is an admin
            *
            * @return {Boolean}
            */
            isAdmin: function() {
                return currentUser.UserType.UserTypeID === 2;
            },

            /**
            * Get auth token
            */
            getToken: function() {
                return $cookies.get('token');
            }
        };
    });
