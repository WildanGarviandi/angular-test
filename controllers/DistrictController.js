var express   = require('express');
var models    = require('../models');
var _ = require('lodash');

var router = express.Router();

/**
 * Handling Sequelize error and send all error messages
 *     in a readable way on frontend side
 * @param  {Object} e - error object from sequelize
 * @return {Array} errors  - rray of error messages
 */
var errorHandling = function (e, error) {

    // NOTE: when DistrictZipCode get validation error in creating a District,
    //      Sequelize still works on bad way, so it will creating a District
    //      with all valid zipcode format THEN throw an error, so 'model' are 
    //      needed to differentiate between a uncreated district on database, 
    //      and (unfortunately) created district.

    e.errors.forEach(function (val) {
        if (/.* len .*/.test(val.message)) {
            var message = 'WARNING some ' + val.path + ' are too long or too short.';
            if (val.path === 'ZipCode') { 
                message = message + ' Will be removed\n';
                error.model = 'zipcode'; 
            } else if (val.path === 'Name') {
                error.model = 'district';
            }
            error.messages += message;
        } else if (/.* notEmpty .*/.test(val.message)) {
            error.messages += val.path + ' cannot be empty. Please give a name\n';
            error.model = 'district';
        } else if (/.* null.*/.test(val.message)){
            error.messages += "WARNING Don't put a comma in the end of zipcode\n";
            error.model = 'zipcode';
        } else {
            error.messages = val.message;
        }
    });

    return error;
};

/**
 * Create district
 * @param  {[type]}   req        - request
 * @param  {[type]}   res        - response
 * @param  {[type]}   arZipCodes - array of zipcodes
 * @param  {[type]}   error      - error object
 * @param  {Function} done       - callback
 * @return {[type]}              [description]
 */
var createDistrict = function (req, res, arZipCodes, error, done) {
    models.District.create({
        Name: req.body.name,
        City: req.body.city,
        Province: req.body.province,
        Latitude: req.body.lat,
        Longitude: req.body.lng,
        DistrictZipCodes: arZipCodes
    }, {
        include: [{
            model: models.DistrictZipCode,
            attributes: ['ZipCode']
        }]
    })
    .then(function (district) {
        done(district);
    })
    .catch(function (e) {
        console.log('Error in creating district: ', e);
        if (e.errors) {
            return res.json({
                status: false,
                error: errorHandling(e, error)
            }, 200);
        } else {
            return res.json({
                status: false,
                description: 'Error in creating district'
            }, 500);
        }
    });
};

// Check is zipcode already exists
var checkZipCodes = function (res, zipcodes, done) {
    var arZipCodes = [];
    var checkedZipCodes = [];
    var filteredZipCodes = [];
    var index = 0;
    if (zipcodes){   
        arZipCodes = zipcodes.split(',');

        // Filter empty element or double comma mistake
        // Filter duplicates
        arZipCodes.forEach(function (val) {
            if (val !== '' && checkedZipCodes.indexOf(val) === -1) {
                filteredZipCodes[index] = { 
                    ZipCode: val
                };
                checkedZipCodes.push(val);
                index++;
            }
        });
    }

    var error = {
        messages: '',
        model: ''
    };

    models.DistrictZipCode.findAll({
        where: {
            ZipCode: {$in: checkedZipCodes}
        }
    })
    .then(function (zipcodes) {
        // ZipCode found in other district
        if (zipcodes.length !== 0) {
            var districts = [];
            _.each(zipcodes, function (zipcode) {
                districts.push(zipcode.DistrictID);
            });
            // Get all district name for that zipcode
            models.District.findAll({
                attributes: ['DistrictID','Name'],
                where: {
                    DistrictID: {$in: districts}
                }
            })
            .then(function (districts) {
                // Assign it to zipcodes array / data
                _.each(zipcodes, function (zipcode, index, array) {
                    var district = _.find(districts, {DistrictID: zipcode.DistrictID});
                    array[index].DistrictName = district.Name;
                });

                // Build the error message
                error = {
                    messages: 'WARNING. Failed in assigning some zipcodes\n',
                    model: 'zipcode'
                };

                _.each(zipcodes, function (zipcode) {
                    error.messages = error.messages + '- ' + zipcode.ZipCode + 
                                    ' is already assigned in disctrict ' + 
                                    zipcode.DistrictName + '\n';
                });

                // Filter out all assigned zipcode
                var tempAr = filteredZipCodes;
                filteredZipCodes = tempAr.filter(function (zipcode) {
                    if (_.find(zipcodes, ['ZipCode',zipcode.ZipCode])) return false;
                    else return true;
                });

                done(filteredZipCodes, error);
            })
            .catch(function (e) {
                console.log('Error in finding zipcode', e);
                return res.json({
                    status: false,
                    description: 'Error in finding zipcode'
                }, 500);
            });
        } else {
            done(filteredZipCodes, null);
        }
    })
    .catch(function (e) {
        console.log('Error in finding zipcode: ', e);
        return res.json({
            status: false,
            description: 'Error in finding zipcode'
        }, 500);
    });
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
        checkZipCodes(res, req.body.zipcodes, function (arZipCodes, error) {
            createDistrict(req, res, arZipCodes, error, function (district) {
                return res.json({
                    status: (error) ? false: true,
                    data: district,
                    error: (error) ? error : null
                }, 200);
            });
        });
    });

    /* R
     * Shows all district with params for searching purpose.
     *  Usage :
     * GET localhost.com/district/search/?q=jakarta&limit=10&offset=20
     */
    router.get('/search',  function(req, res, next){ 
        var zipcode = {};
        var district = {
                    $or: [{
                            Name: { $like: '%' + req.query.q + '%' }
                        },
                        {
                            City: { $like: '%' + req.query.q + '%' }
                        },
                        {
                            Province: { $like: '%' + req.query.q + '%' }
                        }
                    ]
                };
        // Guess, is req.query.q a zipcode or not
        if (req.query.q !== '' && !isNaN(req.query.q)) {
            zipcode = {
                ZipCode: req.query.q
            };
            district = {};
        }

        models.District.findAndCountAll({
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            attributes: {exclude: ['CreatedDate', 'ModifiedDate']},
            include: [{
                model: models.DistrictZipCode,
                attributes: ['ZipCode'],
                where: zipcode
            }], 
            where: district,
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
            }, 500);
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
            }, 500);
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
            }, 500);
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
                Province: req.body.province,
                Latitude: req.body.lat,
                Longitude: req.body.lng
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
                    }, 500);
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
            }, 500);
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
                checkZipCodes(res, req.body.zipcodes, function (arZipCodes, error) {
                    arZipCodes.forEach(function (val, index, array) {
                        array[index].DistrictID = req.body.districtid;
                    });
                    models.DistrictZipCode.bulkCreate(arZipCodes)
                    .then(function(zipCodes) {
                        // note that due to limitation of bulkCreate method,
                        // not all value is returned, in this case all zipCodes
                        // wont return with DisctrictZipCodeID value (null)
                        return res.status(200).json({
                            status: (error) ? false : true,
                            error: (error) ? error : null
                        });
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
                }, 500);
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
            }, 500);
        });
    });

    return router;
};