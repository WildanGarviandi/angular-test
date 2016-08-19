'use strict';

var app = angular.module('config', ['ui.router', 'mainConfig']);

function config() {
    var additionalConfig = {
        features: {
            order: {
                reassign_driver: true,
                reassign_fleet: true,
                set_price: true,
                cancel: true,
                mark_delivered: true,
                bulk_mark_delivered: true,
                return_sender: true,
                copy_cancelled: true
            }
        }
    };
    var config = _.extend({}, mainConfig(), additionalConfig);
    return config;
}

app.constant('config', (config)());