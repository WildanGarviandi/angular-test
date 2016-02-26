var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
    // C
    // Create single district
    router.post('/create',  function(req, res, next){
        try {
            models.Districts.create({
                Name: req.body.name,
                City: req.body.city,
                Province: req.body.province
            })
            .then(function(district) {
                return res.status(200).json({
                    status:true,
                    data: district
                });
            });
        } catch (e) {
            console.error(e.stack);
            console.log('Error in create district: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        }
    });

    // R
    // Shows all districts with params for searching purpose
    router.get('/search',  function(req, res, next){
        models.Districts.count({where: {Name: {$like: '%'+req.query.q+'%'}}})
        .then(function(count) {
            if (count != 0) {   
                models.Districts.findAll({
                    limit: parseInt(req.query.limit),
                    offset: req.query.offset,
                    where: {Name: {$like: '%'+req.query.q+'%'}},
                    order: [['Name', 'ASC']]
                })
                .then(function(districts) {
                    return res.status(200).json({
                        districts: districts,
                        count: count
                    });
                });
            } else {
                return res.status(200).json({
                    districts: districts,
                    count: count
                });
            }
        });
    });

    // Shows all with or without params for populating data
    router.get('/all',  function(req, res, next){
        models.Districts.findAll({
            order: [['Name', 'ASC']],
            limit: parseInt(req.query.limit),
            offset: req.query.offset,
        })
        .then(function(districts) {
            return res.status(200).json({
                districts: districts
            });
        }); 
    });

    // Shows one single district
    router.get('/one',  function(req, res, next){
        models.Districts.findOne({where: {DistrictID: parseInt(req.query._id)}})
        .then(function(district) {
            if (district) {   
                models.DistrictZipCodes.findAll({where: {DistrictID: district.DistrictID}})
                .then(function(zipcodes) {
                    return res.status(200).json({
                        district: district,  
                        zipcodes: zipcodes
                    });
                });
            } else {
                return res.status(200).json({
                    district: 'district not found'
                });
            }
        });
    });

    // Update single district
    router.put('/update',  function(req, res, next){
        try {
            models.Districts.findOne({
                where: {
                    DistrictID: req.body._id
                }
            })
            .then(function(district) {
                district.updateAttributes({
                    Name: req.body.Name,
                    City: req.body.City,
                    Province: req.body.Province
                })
                .then(function(district) {
                    return res.status(200).json({
                        data: district,
                        status: true
                    });
                });
            });
        } catch (e) {
            console.error(e.stack);
            console.log('Error in update district: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        }
    });

    // D
    // Delete single district
    router.delete('/delete',  function(req, res, next){
        try {
            models.Districts.destroy({
                where: {
                  DistrictID: req.body._id
                }
            }).then(function() {
                models.DistrictZipCodes.destroy({
                    where: {
                      DistrictID: req.body.districtid
                    }
                }).then(function(){
                        return res.status(200).json({
                        status: true
                    });
                });
            });
        } catch (e) {
            console.error(e.stack);
            console.log('Error in delete district: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        }
    }); 
    
    return router;
};