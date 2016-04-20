var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
    router.get('/',  function(req, res, next){
        clause = {};
        clause.limit = parseInt(req.query.limit) || 10;
        clause.offset = parseInt(req.query.offset) || 0;
        clause.order = [['Name', 'ASC']];
        clause.where = {};
        if (req.query.search) {
            clause.where.Name = {
                $like: '%'+req.query.search+'%'
            };
        }
        if (req.query.status !== 'all') {
            clause.where.EcommercePriceReferenced = req.query.status;
        }
        models.City.findAndCountAll(clause)
        .then(function(city) {
            return res.status(200).json({
                city: city,
                count: city.count
            });
        });
    });

    router.get('/:id',  function(req, res, next){
        models.City.findOne({
            where: {
                CityID: parseInt(req.params.id)
            }
        }).then(function(city) {
            return res.status(200).json({
                city: city
            });
        });
    });

    //Create single hub
    router.post('/create',  function(req, res, next){
        models.City.create(req.body).then(function(city) {
            return res.status(200).json({
                status:true,
                data: city
            });
        }).catch(function (e) {
            console.error(e.stack)
            console.log('Error in create city: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        });
    });

    //Delete single hub
    router.post('/delete',  function(req, res, next){
        models.City.destroy({
            where: {
              CityID: parseInt(req.body.id)
            }
        }).then(function() {
            return res.status(200).json({
                status: true
            });
        }).catch(function (e) {
            console.error(e.stack)
            console.log('Error in delete city: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        });
    });

    //Update single hub
    router.post('/update',  function(req, res, next){
        models.City.findOne({
            where: {
                CityID: parseInt(req.body.id)
            }
        }).then(function(city) {
            delete req.body.id;
            city.update(req.body).then(function(city) {
                return res.status(200).json({
                    data:city,
                    status: true
                });
            })        
        }).catch(function (e) {
            console.error(e.stack)
            console.log('Error in create hub: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        });
    });

    return router;
};