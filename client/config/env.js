'use strict';

var app = angular.module('config', ['ui.router', 'mainConfig']);

function config() {
    var additionalConfig = {
        
    };
    var config = _.extend({}, mainConfig(), additionalConfig);
    return config;
}

app.constant('config', (config)());

