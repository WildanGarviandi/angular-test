'use strict';

angular.module('adminApp')
    .factory('Auth', function Auth($location, $rootScope, $http, User, $cookies, $q, config, Services2, SweetAlert) {
        var currentUser = {};

        return {

            /**
            * Authenticate token and save token
            *
            * @param  {String}   type     - login type
            * @param  {Object}   param     - login info
            * @param  {Function} callback - optional
            * @return {Promise}
            */
            login: function(type, param, callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();
                var url = config.url + config.endpoints.signIn;

                if (type === 'google') {
                    url = config.url + config.endpoints.signInWithGoogle;
                }

                $http.post(url, param).
                success(function(data) {
                    data = data.data.SignIn;
                    // hubAdmin
                    if (data.RoleID == 3) {
                        $cookies.put('hubAdmin', 'true');
                    }
                    if (!data.RoleID || config.forbiddenRoleID.indexOf(data.RoleID) !== -1) {
                        return SweetAlert.swal({
                            title: 'Error',
                            text: 'Your are unable to access.\nPlease contact tech support',
                            type: 'error'
                        }, function (isConfirm){
                            if (isConfirm) {
                                $http.jsonp('https://accounts.google.com/o/oauth2/revoke?token=' + $cookies.get('access_token'));

                                $cookies.remove('token');
                                $cookies.remove('techSupport');
                                $cookies.remove('access_token');
                                $location.path('/login');
                            }
                        });
                    }
                    $cookies.put('token', data.LoginSessionKey);
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
            * Get admin features
            *
            * @return {Promise}
            */
            getAdminFeatures: function() {
                return $q(function (resolve) {
                    Services2.getAdminFeatures()
                    .$promise.then(function (data) {
                        $cookies.put('techSupport', false);
                        if (data.data && data.data.techsupport) {
                            $cookies.put('techSupport', data.data.techsupport);
                        }
                        resolve(data);
                    });
                });
            },

            /**
            * Delete access token and user info
            *
            * @param  {Function}
            */
            logout: function() {
                $http.jsonp('https://accounts.google.com/o/oauth2/revoke?token=' + $cookies.get('access_token'));
                var url = config.url + config.endpoints.signOut;

                $http({
                  method: 'POST',
                  url: url,
                  data: {token: $cookies.get('token')}
                }).success(function() {
                    $cookies.remove('token');
                    $cookies.remove('techSupport');
                    $cookies.remove('access_token');
                })
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
