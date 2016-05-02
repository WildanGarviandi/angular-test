'use strict';

function env() {
    var location = window.location.host;
    var parts = location.split('.');
    var app = parts[0];
    var country = parts[parts.length - 1];
    switch (app + '|' + country) {
        case 'staging|com':
            var url = 'http://staging.api2.etobee.com';
            var currency = 'Rp';
            break;        
        case 'admin2|com':
            var url = 'http://api2.etobee.com';
            var currency = 'Rp';
            break;    
        case 'staging|ph':
            var url = 'http://staging.api2.etobee.com';
            var currency = 'PHP';
            break;    
        case 'admin2|ph':
            var url = 'http://api2.etobee.com.ph';
            var currency = 'PHP';
            break;
        default:
            var url = 'http://localhost:3001';
            var currency = 'Rp';
    } 
    return  {
        'currency': currency,
        'url': url + '/v2/admin/',
        'endpoints': {
            'signIn': 'sign-in'
        } 
    }
}

var app = angular.module('config', ['ui.router']);
app.constant('config', (env)());

