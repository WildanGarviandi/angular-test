var email = require('emailjs');
var config = require('../config');

var server = email.server.connect({
	user: config.email.user,
	password: config.email.password,
	host: config.email.host,
	tls: config.email.tls,
});

module.exports = server;