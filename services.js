var services = {};

function includeService(name, service) {
    services[name] = require('./services/' + service);
}

// list services here

module.exports = services;