'use strict';

function env() {
    var location = window.location.host;
    var parts = location.split('.');
    var app = parts[0];
    var country = parts[parts.length - 1];
    switch (app + '|' + country) {
        case 'staging|com':
            var url = 'http://staging.api2.etobee.com';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var zipLength = 5;
            break;        
        case 'admin2|com':
            var url = 'http://api2.etobee.com';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var zipLength = 5;
            break;    
        case 'staging|ph':
            var url = 'http://staging.api2.etobee.com';
            var defaultLocation = { Latitude: 14.5974875, Longitude: 120.9542445 };
            var currency = '₱';
            var zipLength = 4;
            break;    
        case 'admin2|ph':
            var url = 'http://api2.etobee.com.ph';
            var defaultLocation = { Latitude: 14.5974875, Longitude: 120.9542445 };
            var currency = '₱';
            var zipLength = 4;
            break;
        default:
            var url = 'http://localhost:3001';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var zipLength = 5;
            break;
    } 

    return  {
        currency: currency,
        zipLength: zipLength,
        url: url + '/v2/admin/',
        endpoints: {
            signIn: 'sign-in',
        },
        defaultLocation: defaultLocation,
        notCancellableOrderStatus: [4, 5, 13, 16],
        // INTRANSIT, DELIVERED, CANCELLED, RETURNED_SENDER
        reassignableOrderStatus: [2, 6, 10, 12, 15]
        // ACCEPTED, NOTASSIGNED, NO-DRIVER, EXPIRED, RETURNED_WAREHOUSE
    };
}

var app = angular.module('config', ['ui.router']);
app.constant('config', (env)());

