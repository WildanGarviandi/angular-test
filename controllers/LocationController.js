var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
	router.get('/city',  function(req, res, next){
		models.City.findAll({
			where: {
				Name: {
					$like: '%'+req.query.address+'%'
				}
			}
		})
		.then(function(cities) {
			return res.status(200).json({
		    	cities: cities
		  	});
		});
	});

	router.get('/state',  function(req, res, next){
		models.State.findAll({
			where: {
				Name: {
					$like: req.query.address+'%'
				}
			}
		})
		.then(function(states) {
			return res.status(200).json({
		    	states: states
		  	});
		});
	});

	router.post('/states',  function(req, res, next){
		models.State.findAll({
			where: {
				CountryID: req.body.CountryID,
			},
			include: [{
				model: models.City
			}]
		})
		.then(function(states) {
			return res.status(200).json({
		    	states: states
		  	});
		});
	});

	router.get('/country',  function(req, res, next){
		models.Country.findAll({
			where: {
				Name: {
					$like: req.query.address+'%'
				}
			}
		})
		.then(function(countries) {
			return res.status(200).json({
		    	countries: countries
		  	});
		});
	});

	return router;
};