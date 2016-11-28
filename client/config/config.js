'use strict';

var app = angular.module('config', ['ui.router', 'envConfig']);

function mainConfig() {
    var location = window.location.host;
    var parts = location.split('.');
    var app = parts[0];
    var country = parts[parts.length - 1];
    switch (app + '|' + country) {
        case 'staging|com':
            var url = 'http://staging.api2.etobee.com';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            break;   
        case 'sandbox-v3|com':
            var url = 'http://sandbox-v2.api2.etobee.com';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            break;        
        case 'admin2|com':
            var url = 'https://api2.etobee.com';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            break;    
        case 'staging|ph':
            var url = 'http://staging.api2.etobee.com';
            var defaultLocation = { Latitude: 14.5974875, Longitude: 120.9542445 };
            var currency = '₱';
            var decimalSeparator = '.';
            var zipLength = 4;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+63';
            break;    
        case 'admin2|ph':
            var url = 'http://api2.etobee.com.ph';
            var defaultLocation = { Latitude: 14.5974875, Longitude: 120.9542445 };
            var currency = '₱';
            var decimalSeparator = '.';
            var zipLength = 4;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+63';
            break;
        default:
            var url = 'http://localhost:3001';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';    
            break;
    } 

    return  {
        currency: currency,
        decimalSeparator: decimalSeparator,
        zipLength: zipLength,
        url: url + '/v2/admin/',
        endpoints: {
            signIn: 'sign-in'
        },
        defaultLocation: defaultLocation,
        notCancellableOrderStatus: [4, 5, 13, 16],
        // INTRANSIT, DELIVERED, CANCELLED, RETURNED_SENDER
        reassignableOrderStatus: [2, 6, 10, 12, 15, 3],
        // ACCEPTED, NOTASSIGNED, NO-DRIVER, EXPIRED, RETURNED_WAREHOUSE, PICKUP
        activeGoal: 1500,
        activeMerchant: activeMerchant,
        countryCode: countryCode,
        deliverableOrderStatus: [2, 3, 4],
        // ACCEPTED, PICKUP, IN-TRANSIT
        reassignableDriver: [2, 3, 4, 6],
        // ACCEPTED, PICKUP, IN-TRANSIT
        reassignableFleet: [1, 3, 6, 9],
        // BOOKED, NOTASSIGNED, PREBOOKED
        updatablePrice: [1, 6, 9],
        // BOOKED, NOTASSIGNED, PREBOOKED
        returnableWarehouse: [2, 3, 4],
        returnableSender: [15],
        defaultReturnReason : {
            ReasonName: 'MANUAL_PROCESS',
            ReasonID: 11
        },
        packageDimensionID: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        canChangeToPickup: [6]
    };
}

function config() {
    return _.extend({}, mainConfig(), envConfig());
}

app.constant('config', (config)());