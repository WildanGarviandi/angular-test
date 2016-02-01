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

	//Routes all to index.html
	router.get('*', function(req, res, next) {
	  res.sendfile('client/index.html');
	});

	/*app.route('*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });*/

	return router;

};