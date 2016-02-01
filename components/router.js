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

	defineRoute(router, '/auth/local', 'Login')
	defineRoute(router, '/webapi/me', 'User');

	app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });

	return router;

};