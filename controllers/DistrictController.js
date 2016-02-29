var express   = require('express');
var models    = require('../models');

var router = express.Router();

/**
 * Handling Sequelize error and send all error messages
 *     in a readable way on frontend side
 * @param  {Object} e - error object from sequelize
 * @return {Array} errors  - rray of error messages
 */
var errorHandling = function (e) {
    var errors = [];

    e.errors.forEach(function (val) {
        if (/.* len .*/.test(val.message)) {
            errors.push(val.path + ' too long');
        } else if (/.* notEmpty .*/.test(val.message)) {
            errors.push(val.path + ' cannot be empty');
        }
    });

    return errors;
};

module.exports = function(di) {
    // C
    // Create single district
    router.post('/create',  function (req, res, next){
        try {
            models.Districts.create({
                Name: req.body.name,
                City: req.body.city,
                Province: req.body.province
            })
            .then(function (district) {
                return res.status(200).json({
                    status:true,
                    data: district
                });
            })
            .catch(function (e) {
                return res.json({
                    error: errorHandling(e)
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
        models.Districts.findAndCountAll({
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            where: {Name: {$like: '%'+req.query.q+'%'}},
            order: [['Name', 'ASC']]
        })
        .then(function(districts) {
            return res.status(200).json({
                districts: districts.rows,
                count: districts.count
            });
        });
    });

    // Shows all with or without params for populating data
    router.get('/all',  function(req, res, next){
        models.Districts.findAndCountAll({
            order: [['Name', 'ASC']],
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
        })
        .then(function(districts) {
            return res.status(200).json({
                districts: districts.rows,
                count: districts.count
            });
        }); 
    });

    // Shows one single district
    router.get('/one',  function(req, res, next){
        models.Districts.findOne({
            where: {DistrictID: parseInt(req.query._id)}
        })
        .then(function(district) {
            if (district) {   
                models.DistrictZipCodes.findAll({
                    where: {DistrictID: district.DistrictID}
                })
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
    router.put('/update/:id',  function(req, res, next){
        try {
            models.Districts.findOne({
                where: {
                    DistrictID: req.params.id
                }
            })
            .then(function(district) {
                district.updateAttributes({
                    Name: req.body.name,
                    City: req.body.city,
                    Province: req.body.province
                })
                .then(function(district) {
                    return res.status(200).json({
                        data: district,
                        status: true
                    });
                })
                .catch(function (e) {
                    return res.json({
                        error: errorHandling(e)
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
                  DistrictID: req.query._id
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

    // C & U Zipcodes
    // Add / Re-add zipcodes
    // All format of request are :
    //  this    {   districtid = 1
    //          zipcodes = 23112,24321,56345      }
    //  or this  {   districtid = 1, zipcodes = ''   } will empty all zipcodes      
    router.post('/add-zipcodes', function(req, res, next){
        try {
            models.DistrictZipCodes.destroy({
                where: {
                  DistrictID: req.body.districtid
                }
            }).then(function() {
                var arZipCodes = req.body.zipcodes.split(',');
                console.log(arZipCodes);
                arZipCodes.forEach(function (val, index, array) {
                    array[index] = { 
                        DistrictID: req.body.districtid,
                        ZipCode: val
                    };
                });
                console.log(arZipCodes);
                models.DistrictZipCodes.bulkCreate(arZipCodes)
                .then(function(zipCodes) {
                    // note that due to limitation of bulkCreate method,
                    // not all value is returned, in this case all zipCodes
                    // wont return with DisctrictZipCodeID value (null)
                    return res.status(200).json({
                        data: zipCodes
                    });
                });
            });
        } catch (e) {
            console.error(e.stack);
            console.log('Error in save zipcodes: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        }
    });

    // R
    // Get zipcodes of district 
    router.get('/get-zipcodes', function(req, res, next) {
        models.DistrictZipCodes.findAll({
            where: {
                DistrictID: req.query.districtid
            }
        })
        .then(function(zipCodes) {
            return res.status(200).json({
                data: zipCodes
            });
        });
    });

    return router;
};