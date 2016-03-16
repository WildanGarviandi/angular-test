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

    // NOTE: when DistrictZipCode get validation error in creating a District,
    //      Sequelize still works on bad way, so it will creating a District
    //      with all valid zipcode format THEN throw an error, so 'model' are 
    //      needed to differentiate between a uncreated district on database, 
    //      and (unfortunately) created district.

    var error = {
        messages: [],
        model: ''
    };

    e.errors.forEach(function (val) {
        if (/.* len .*/.test(val.message)) {
            var message = 'WARNING some ' + val.path + ' are too long or too short.';
            if (val.path === 'ZipCode') { 
                message = message + ' Will be removed';
                error.model = 'zipcode'; 
            } else if (val.path === 'Name') {
                error.model = 'district';
            }
            error.messages.push(message);
        } else if (/.* notEmpty .*/.test(val.message)) {
            error.messages.push(val.path + ' cannot be empty. Please give a name');
            error.model = 'district';
        } else if (/.* null.*/.test(val.message)){
            error.messages.push("WARNING Don't put a comma in the end of zipcode");
            error.model = 'zipcode';
        } else {
            error.messages.push(val.message);
        }
    });

    return error;
};

module.exports = function(di) {

    /* C
     * Create single district.
     *  Usage:
     *  POST localhost.com/district/create
     *  {
     *      name: string
     *      city: string
     *      province: string
     *  }
     */
    router.post('/create',  function (req, res, next){
        var arZipCodes = [];
        if (req.body.zipcodes){   
            arZipCodes = req.body.zipcodes.split(',');
            arZipCodes.forEach(function (val, index, array) {
                if (val !== '') {
                    array[index] = { 
                        ZipCode: val
                    }; 
                }
            });
        }

        var tempDistrict = {};

        models.District.create({
            Name: req.body.name,
            City: req.body.city,
            Province: req.body.province,
            DistrictZipCodes: arZipCodes
        }, {
            include: [{
                model: models.DistrictZipCode,
                attributes: ['ZipCode']
            }]
        })
        .then(function (district) {
            tempDistrict = district;
            return res.json({
                status: true,
                data: district
            }, 200);
        })
        .catch(function (e) {
            if (e.errors) {
                return res.json({
                    status: false,
                    error: errorHandling(e)
                }, 200);
            } else {
                console.log('Error in creating district: ', e);
                res.json({
                    status: false,
                    description: 'Error in creating district'
                }, 403);
            }
        });
    });

    /* R
     * Shows all district with params for searching purpose.
     *  Usage :
     * GET localhost.com/district/search/?q=jakarta&limit=10&offset=20
     */
    router.get('/search',  function(req, res, next){
        models.District.findAndCountAll({
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            where: {
                $or: [{
                    Name: { $like: '%' + req.query.q + '%' }
                },
                {
                    City: { $like: req.query.q + '%' }
                },
                {
                    Province: { $like: req.query.q + '%' }
                }]
            },
            order: [['Name', 'ASC']]
        })
        .then(function(districts) {
            return res.status(200).json({
                districts: districts.rows,
                count: districts.count
            });
        })
        .catch(function (e) {
            // sequelize error
            console.log('Error in finding district: ', e);
            return res.json({
                status: false,
                description: 'Error in finding district'
            }, 403);
        });
    });

    /* Shows all with or without params for populating data.
     *  Usage:
     *  GET localhost.com/district/all/?limit=10&offset=20&zipcode=true
     *      if zipcode=true, data will come with it zipcodes
     */
    router.get('/all',  function(req, res, next){
        var withZipCode = [];
        if (req.query.zipcode === 'true') {
            withZipCode = [{
                model: models.DistrictZipCode,
                attributes: ['ZipCode']
            }];
        }
        models.District.findAndCountAll({
            order: [['Name', 'ASC']],
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            include: withZipCode
        })
        .then(function(districts) {
            return res.status(200).json({
                districts: districts.rows,
                count: districts.count
            });
        })
        .catch(function (e) {
            // sequelize error
            console.log('Error in finding district: ', e);
            return res.json({
                status: false,
                description: 'Error in finding district'
            }, 403);
        });
    });

    /* Shows one single district.
     *  Usage:
     *  GET localhost.com/district/one/1234
     */
    router.get('/one/:id',  function(req, res, next){
        models.District.findOne({
            where: {
                DistrictID: parseInt(req.params.id)
            },
            include: [{
                model: models.DistrictZipCode,
                attributes: ['ZipCode']
            }]
        })
        .then(function(district) {
            if (district) {   
                return res.status(200).json({
                    district: district
                });
            } else {
                return res.status(200).json({
                    district: 'district not found'
                });
            }
        }).catch(function (e) {
            // sequelize error
            console.log('Error in finding district: ', e);
            return res.json({
                status: false,
                description: 'Error in finding district'
            }, 403);
        });
    });

    /* Update single district
     *  Usage:
     *  PUT localhost.com/district/update/1234
     */
    router.put('/update/:id',  function(req, res, next){
        models.District.findOne({
            where: {
                DistrictID: parseInt(req.params.id)
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
                if (e.errors) { // validation error
                    return res.json({
                        error: errorHandling(e)
                    });
                } else { // sequelize error
                    console.log('Error in updating district: ', e);
                    res.json({
                        status: false,
                        description: 'Error in updating district'
                    }, 403);
                }
            });
        });
    });

    /* D
     * Delete single district
     *  Usage:
     *  DELETE localhost.com/district/delete/1234
     */
    router.delete('/delete/:id',  function(req, res, next){
        models.District.destroy({
            where: {
              DistrictID: req.params.id
            }
        }).then(function() {
            models.DistrictZipCode.destroy({
                where: {
                  DistrictID: req.body.districtid
                }
            }).then(function(){
                return res.status(200).json({
                    status: true
                });
            });
        })
        .catch(function (e) {
            // sequelize error
            console.log('Error in deleting district: ', e);
            return res.json({
                status: false,
                description: 'Error in deleting district'
            }, 403);
        });
    }); 

    /* C & U Zipcodes
     * Add / Re-add zipcodes
     *  Usages :
     *  POST localhost.com/district/add-zipcodes
     *  with this    {   districtid = 1, zipcodes = 23112,24321,56345      }
     *  or this  {   districtid = 1, zipcodes = ''   } will empty/delete all zipcodes on that id
     */
    router.post('/add-zipcodes', function(req, res, next){
        models.DistrictZipCode.destroy({
            where: {
              DistrictID: req.body.districtid
            }
        }).then(function() {
            if (req.body.zipcodes) {
                var arZipCodes = req.body.zipcodes.split(',');
                arZipCodes.forEach(function (val, index, array) {
                    if (val !== '') {
                        array[index] = { 
                            DistrictID: req.body.districtid,
                            ZipCode: val
                        };
                    }
                });
                models.DistrictZipCode.bulkCreate(arZipCodes)
                .then(function(zipCodes) {
                    // note that due to limitation of bulkCreate method,
                    // not all value is returned, in this case all zipCodes
                    // wont return with DisctrictZipCodeID value (null)
                    return res.status(200).json({
                        status: true
                    });
                });
            } else {
                return res.status(200).json({
                    status: true
                });
            }
        })
        .catch(function (e) {
            if (e.errors) { // validation error
                return res.json({
                    error: errorHandling(e)
                });
            } else { // sequelize error
                console.log('Error in updating zipcodes: ', e);
                res.json({
                    status: false,
                    description: 'Error in updating zipcodes'
                }, 403);
            }
        });
    });

    /* R
     * Get zipcodes of district 
     *  Usage:
     *  GET localhost.com/district/get-zipcodes?districtid=11
     */
    router.get('/get-zipcodes', function(req, res, next) {
        models.DistrictZipCode.findAll({
            where: {
                DistrictID: req.query.districtid
            }
        })
        .then(function(zipCodes) {
            return res.status(200).json({
                data: zipCodes
            });
        })
        .catch(function (e) {
            // sequelize error
            console.log('Error in finding zipcode: ', e);
            return res.json({
                status: false,
                description: 'Error in finding zipcode'
            }, 403);
        });
    });

    return router;
};