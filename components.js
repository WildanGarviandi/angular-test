
var di = {};

// components that don't use dependency injection
di.config = require('./config');

function includeComponent(name, component){
	di[name] = require('./components/' + component)(di);
}

// add components
includeComponent('router', 'router');
// includeComponent('authentication', 'authentication-bookshelf');

// app and then server must be defined last
includeComponent('app', 'app');
includeComponent('server', 'server');

// last: include services
// di.services = require('./services');

module.exports = di;