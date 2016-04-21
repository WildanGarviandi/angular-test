var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');
var passport = require('passport');

module.exports = function(di){

	function defineRoute(router, path, controller){
		var controller = require('../controllers/'+controller+'Controller')(di);
		router.use(path, controller);
	}

	defineRoute(router, '/auth', 'Login');
	defineRoute(router, '/user', 'User');
	defineRoute(router, '/hubs', 'Hub');
	defineRoute(router, '/location', 'Location');
	defineRoute(router, '/company', 'Company');
	defineRoute(router, '/webstore', 'Webstore');
	defineRoute(router, '/price', 'Price');
	defineRoute(router, '/districts', 'District');
	defineRoute(router, '/trip', 'Trip');
	defineRoute(router, '/status', 'Status');

	//Routes all to index.html
	router.get('*', function(req, res, next) {
	  res.sendfile('client/index.html');
	});

	return router;

};