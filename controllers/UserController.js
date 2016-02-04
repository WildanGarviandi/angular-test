var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
	router.get('/me',  function(req, res, next){
		models.User.findOne({
			where: {
				UserID: req.cookies.userID
			}
		})
		.then(function(user) {
			return res.status(200).json({
		    	profile: user
		  	});
		});
	});

	return router;
};