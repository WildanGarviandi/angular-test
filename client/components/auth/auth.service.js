'use strict';

angular.module('adminApp')
    .factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, $q) {
        var currentUser = {};
        if ($cookieStore.get('token')) {
          currentUser = User.get();
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

                $http.post('http://localhost:3001/v2/admin/sign-in', {
                    username: user.username,
                    password: user.password
                }).
                success(function(data) {
                    data = data.data.SignIn;
                    $cookieStore.put('token', data.LoginSessionKey);
                    $cookieStore.put('userID', data.UserID);
                    currentUser = User.get();
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
                $cookieStore.remove('token');
                currentUser = {};
            },

            /**
            * Gets all available info on authenticated user
            *
            * @return {Object} user
            */
            getCurrentUser: function() {
                return currentUser;
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
                if (currentUser.hasOwnProperty('$promise')) {
                    currentUser.$promise.then(function() {
                    cb(true);
                    }).catch(function() {
                        cb(false);
                    });
                } else if (currentUser.hasOwnProperty('role')) {
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
                return currentUser.role === 'admin';
            },

            /**
            * Get auth token
            */
            getToken: function() {
                return $cookieStore.get('token');
            }
        };
    });
