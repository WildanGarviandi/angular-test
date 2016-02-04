var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
	//Shows all companies
	router.get('/all',  function(req, res, next){
		models.CompanyDetail.findAll({
			order: [['CompanyName', 'ASC']]
		})
		.then(function(companies) {
			return res.status(200).json({
		    	companies: companies
		  	});
		});	
	});

	return router;
};