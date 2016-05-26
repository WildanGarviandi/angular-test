'use strict';

angular.module('adminApp')
    .factory('Auth', function Auth($location, $rootScope, $http, User, $cookies, $q, config, Services2) {
        var currentUser = {};

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
                    $cookies.put('token', JSON.stringify(data.LoginSessionKey));
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
            },

            /**
            * Gets all available info on authenticated user
            *
            * @return {Object} user
            */
            getCurrentUser: function() {
                return $q(function (resolve) {
                    Services2.getUserProfile()
                    .$promise.then(function (result) {
                        currentUser = result.data.User;
                        var data = {};
                        data.profile = currentUser;
                        resolve(data);
                    });
                });
            },

            /**
            * Check if a user is logged in
            *
            * @return {Boolean}
            */
            isLoggedIn: function(cb) {
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
                return $q(function (resolve) {
                    Services2.getUserProfile()
                    .$promise.then(function (result) {
                        currentUser = result.data.User;
                        resolve(currentUser.UserType.UserTypeID === 2);
                    });
                });
            },

            /**
            * Get auth token
            */
            getToken: function() {
                return JSON.parse($cookies.get('token'));
            }
        };
    });
