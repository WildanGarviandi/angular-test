'use strict';

angular.module('adminApp', [
    'ngCookies',
    'ngAnimate',
    'ngResource',
    'smart-table',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'uiGmapgoogle-maps',
    'ngFileUpload',
    'ui.select',
    'ngDialog',
    'angularSpinner',
    'daterangepicker',
    'ngMapAutocomplete',
    'ui.bootstrap.datetimepicker',
    'chart.js',
    'angularMoment',
    'ngLodash',
    'LocalStorageModule',
    'config',
    'ui.grid',
    'ui.grid.edit',
    'ui.grid.pinning',
    'ui.grid.cellNav',
    'ui.grid.autoResize',
    'oitozero.ngSweetAlert',
    'dynamicNumber',
    'xeditable',
    'ui-notification'
])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $urlRouterProvider
        .when('/', '/dashboard')
        .otherwise('/dashboard');

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('errorInterceptor');
    })

    .config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            //    key: 'your api key',
            v: '3.20', //defaults to latest 3.X anyhow
            libraries: 'weather,geometry,visualization,places'
        });
    })

    .config(['usSpinnerConfigProvider', function(usSpinnerConfigProvider) {
        usSpinnerConfigProvider.setDefaults({
            lines: 17, // The number of lines to draw
            length: 0, // The length of each line
            width: 22, // The line thickness
            radius: 30, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 10, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#fff', // #rgb or #rrggbb or array of colors
            speed: 1.3, // Rounds per second
            trail: 100, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        });
    }])

    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
        .setPrefix('etobee');
    })

    .factory('errorInterceptor', function ($rootScope, $q, $cookies, $location, $window, SweetAlert) {
        return {
            // Add authorization token to headers
            request: function (config) {
                config.headers = config.headers || {};
                if ($cookies.get('token')) {
                    config.headers.LoginSessionKey = $cookies.get('token');
                }
                return config;
            },

            responseError: function(response) {
                if(response.status === 403) {
                    // Intercept 403s and redirect you to login
                    $location.path('/login');
                    // remove any stale tokens
                    $cookies.remove('token');
                    return $q.reject(response);
                } else if(response.status <= 0) {
                    // Intercept connection error
                    SweetAlert.swal({
                        title: 'Error',
                        text :'No connection to the API, please check your internet connection.' + 
                                'If the problem still persists, please contact tech support (tech@etobee.com).' +
                            '\n' + '\n' + 'Click OK to reload this page.'
                    }, function () {
                        $window.location.reload();
                        return $q.reject(response);
                    });
                } else {
                    return $q.reject(response);
                }
            }
        };
    })

    .run(function ($rootScope, $location, Auth, localStorageService, usSpinnerService, editableOptions) {

        $rootScope.expanded = localStorageService.get('expanded');

        // Redirect to login if route requires auth and you're not logged in
        $rootScope.$on('$stateChangeStart', function (event, next) {
            Auth.isLoggedIn(function(loggedIn) {
                if (next.authenticate && !loggedIn) {
                    $location.path('/login');
                }
            });
        });

        $rootScope.$on('expand', function (event, next) {
            $rootScope.expanded = true;
        });

        $rootScope.$on('collapse', function (event, next) {
            $rootScope.expanded = false;
        });

        $rootScope.$on('startSpin', function() {
            $rootScope.spinnerShown = true;
            usSpinnerService.spin('spinner-1');
        });

        $rootScope.$on('stopSpin', function() {
            usSpinnerService.stop('spinner-1');
            $rootScope.spinnerShown = false;
        });

        editableOptions.theme = 'bs3';
    })

    .filter('secondsToDateTime', function() {
        return function(seconds) {
            var d = new Date(0,0,0,0,0,0,0);
            d.setSeconds(seconds);
            return d;
        };
    });
