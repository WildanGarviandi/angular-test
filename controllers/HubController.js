var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
	router.get('/all',  function(req, res, next){
		models.Hubs.findAll({
			offset: 10,
			limit: 2
		})
		.then(function(hubs) {
			return res.status(200).json({
		    hubs: hubs
		  });
		});
	});

	return router;
};