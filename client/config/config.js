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
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://staging.track.etobee.com';
            break;   
        case 'sandbox-v3|com':
            var url = 'http://sandbox-v2.api2.etobee.com';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://staging.track.etobee.com';
            break;        
        case 'admin2|com':
            var url = 'https://api2.etobee.com';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://track.etobee.com';
            break;    
        case 'staging|ph':
            var url = 'http://staging.api2.etobee.com';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: 14.5974875, Longitude: 120.9542445 };
            var currency = '₱';
            var decimalSeparator = '.';
            var zipLength = 4;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+63';
            var webtrackingURL = 'http://staging.track.etobee.com';
            break;    
        case 'admin2|ph':
            var url = 'http://api2.etobee.com.ph';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: 14.5974875, Longitude: 120.9542445 };
            var currency = '₱';
            var decimalSeparator = '.';
            var zipLength = 4;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+63';
            var webtrackingURL = 'http://track.etobee.com.ph';
            break;
        case 'admin|com':
            var url = 'https://api2.etobee.com';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://track.etobee.com';
            break;
        case 'admin|ph':
            var url = 'http://api2.etobee.com.ph';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: 14.5974875, Longitude: 120.9542445 };
            var currency = '₱';
            var decimalSeparator = '.';
            var zipLength = 4;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+63';
            var webtrackingURL = 'http://track.etobee.com.ph';
            break;
        case 'sandbox-v3|com':
            var url = 'http://sandbox-v2.api2.etobee.com';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://staging.track.etobee.com';
            break;
        case 'dev-dbs-admin|com':
            var url = 'https://dev-dbs-api2.etobee.com';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://staging.track.etobee.com';
            break;
        case 'dev-dbs-admin|com:444':
            var url = 'https://dev-dbs-api2.etobee.com';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://staging.track.etobee.com';
            break;
        case 'dbs-admin|com':
            var url = 'https://dbs-api2.etobee.com';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://staging.track.etobee.com';
            break;
        default:
            var url = 'http://localhost:3001';
            var urlSocket = 'http://localhost:3099';
            var defaultLocation = { Latitude: -6.2115, Longitude: 106.8452 };
            var currency = 'Rp';
            var decimalSeparator = ',';
            var zipLength = 5;
            var activeMerchant = [0, 0, 0, 0, 0, 0];
            var countryCode = '+62';
            var webtrackingURL = 'http://staging.track.etobee.com';
            break;
    } 

    return  {
        currency: currency,
        decimalSeparator: decimalSeparator,
        zipLength: zipLength,
        url: url + '/v2/admin/',
        urlSocket: urlSocket,
        endpoints: {
            signIn: 'sign-in',
            signInWithGoogle: 'sign-in-with-google',
            signOut: 'sign-out'
        },
        defaultLocation: defaultLocation,
        notCancellableOrderStatus: [4, 5, 13, 16],
        // INTRANSIT, DELIVERED, CANCELLED, RETURNED_SENDER
        reassignableOrderStatus: [2, 6, 10, 12, 15, 3, 17],
        // ACCEPTED, NOTASSIGNED, NO-DRIVER, EXPIRED, RETURNED_WAREHOUSE, PICKUP, MISSING
        activeGoal: 1500,
        activeMerchant: activeMerchant,
        countryCode: countryCode,
        deliverableOrderStatus: [2, 3, 4],
        // ACCEPTED, PICKUP, IN-TRANSIT
        reassignableDriver: [2, 3, 4, 6, 15, 17],
        // ACCEPTED, PICKUP, IN-TRANSIT, RETURNED_WAREHOUSE, MISSING
        reassignableFleet: [1, 3, 6, 9, 15, 17],
        // BOOKED, NOTASSIGNED, PREBOOKED, RETURNED_WAREHOUSE, MISSING
        updatablePrice: [1, 6, 9, 2, 3, 4],
        // BOOKED, NOTASSIGNED, PREBOOKED, ACCEPTED, PICKUP, IN-TRANSIT
        returnableWarehouse: [2, 3, 4, 17],
        returnableSender: [15],
        defaultReturnReason : {
            ReasonName: 'MANUAL_PROCESS',
            ReasonID: 11
        },
        packageDimensionID: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        canChangeToPickup: [6],
        canChangeToMissing: [3, 4, 15],
        canChangeToClaimed: [17, 18, 19],
        canChangeToClaimedMerchant: [17, 18],
        canChangeToClaimedVendor: [17, 19],
        webtrackingURL: webtrackingURL,
        googleClientId: '196844091368-igtekd4ke8h75r03f0c9rf9k63n9ltc0.apps.googleusercontent.com',
        canSetHub: [1, 2, 6]
    };
}

function config() {
    return _.extend({}, mainConfig(), envConfig());
}

app.constant('config', (config)());