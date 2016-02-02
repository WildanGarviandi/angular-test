var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
	router.get('/all',  function(req, res, next){
		models.Hubs.findAll({
			limit: 10
		})
		.then(function(hubs) {
			return res.status(200).json({
		    hubs: hubs
		  });
		});
	});

	router.get('/one',  function(req, res, next){
		console.log(req.query._id);
		models.Hubs.findOne({where: {HubID: req.query._id}})
		.then(function(hub) {
			models.Hubs.findOne({where: {HubID: hub.ParentHubID}})
			.then(function(parent) {
				return res.status(200).json({
			    hub: hub, parent: parent
			  });
			});
		});
	});

	router.post('/create',  function(req, res, next){
		try {
		    // Add to db
			models.Hubs.create(req.body).then(function(hubs) {
	  			return res.status(200).json({
	  			status:true,
			    data: hubs
			  });
			})
		} catch (e) {
		    console.error(e.stack)
		    console.log('Error in create hub: ', e);
		    return res.json({
		      status: false,
		      description: e
		    }, 403);
		  }
	});

	router.post('/delete',  function(req, res, next){
		console.log(req.body._id)
		try {
			models.Hubs.destroy({
			    where: {
			      HubID: req.body._id
			    }
			}).then(function() {
				return res.status(200).json({
			    status: true
			  });
			});
		} catch (e) {
		    console.error(e.stack)
		    console.log('Error in delete hub: ', e);
		    return res.json({
		      status: false,
		      description: e
		    }, 403);
		  }
	});

	router.post('/update',  function(req, res, next){
		try {
		    // Update to db
		    models.Hubs.findOne({
				where: {
					HubID: req.body.HubID
				}
			})
			.then(function(hub) {
				delete req.body.HubID
				hub.update(req.body).then(function(hub) {
					return res.status(200).json({
						data:hub,
			    		status: true
			  		});
				})
			});
		} catch (e) {
		    console.error(e.stack)
		    console.log('Error in create hub: ', e);
		    return res.json({
		      status: false,
		      description: e
		    }, 403);
		  }
	});

	return router;
};