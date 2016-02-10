var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
    //Shows all hubs with params
    router.post('/show',  function(req, res, next){
        models.Hubs.count({where: {Name: {$like: '%'+req.body.search+'%'}}}).then(function(count) {
            models.Hubs.findAll({
                limit: req.body.count,
                offset: req.body.offset,
                where: {Name: {$like: '%'+req.body.search+'%'}},
                order: [['Name', 'ASC']]
            })
            .then(function(hubs) {
                return res.status(200).json({
                    hubs: hubs,
                    count: count
                });
            });
        })      
    });

    //Shows all hubs without params
    router.post('/all',  function(req, res, next){
        models.Hubs.findAll({
            order: [['Name', 'ASC']]
        })
        .then(function(hubs) {
            return res.status(200).json({
                hubs: hubs
            });
        }); 
    });

    //Shows one single hub
    router.get('/one',  function(req, res, next){
        models.Hubs.findOne({where: {HubID: req.query._id}})
        .then(function(hub) {
            models.Hubs.findOne({where: {HubID: hub.ParentHubID}})
            .then(function(parent) {
                models.HubZipCodes.findAll({where: {HubID: hub.HubID}})
                .then(function(zipcodes) {
                    return res.status(200).json({
                        hub: hub, 
                        parent: parent, 
                        zipcodes: zipcodes
                    });
                });
            });
        });
    });

    //Create single hub
    router.post('/create',  function(req, res, next){
        try {
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

    //Delete single hub
    router.post('/delete',  function(req, res, next){
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

    //Update single hub
    router.post('/update',  function(req, res, next){
        try {
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

    //Save zipcodes
    router.post('/add-zipcodes',  function(req, res, next){
        try {
            models.HubZipCodes.destroy({
                where: {
                  HubID: req.body._id
                }
            }).then(function() {
                models.HubZipCodes.bulkCreate(req.body.params).then(function(hubs) {
                    return res.status(200).json({
                        status:true,
                        data: hubs
                    });
                })
            });
        } catch (e) {
            console.error(e.stack)
            console.log('Error in save zipcodes: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
          }
    });

    return router;
};