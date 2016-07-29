var express   = require('express');
var models    = require('../models');
var crypto = require('crypto');

var router = express.Router();

module.exports = function(di) {
    //Relationship
    models.User.hasOne(models.WebstoreCompany, {foreignKey: 'UserID'})
    models.User.hasOne(models.UserLogins, {foreignKey: 'UserID'})
    models.WebstoreCompany.belongsTo(models.Hubs, {foreignKey: 'HubID'})
    models.WebstoreCompany.belongsTo(models.UserAddress, {foreignKey: 'UserAddressID'})

    //Shows all webstores
    router.get('/all',  function(req, res, next){
        models.User.findAll({
            where: {UserTypeID: 5},
            order: [['FirstName', 'ASC'], ['LastName', 'ASC']],
            include: [{
                    model: models.WebstoreCompany,
                    include: [
                        {model: models.UserAddress}
                        ]
                    }
                ]
        })
        .then(function(webstores) {
            return res.status(200).json({
                webstores: webstores
            });
        }); 
    });

    //Shows all webstores with params
    router.post('/show',  function(req, res, next){
        //Count users
        models.User.count({
            where: {
                FirstName: {
                    $like: '%'+req.body.search+'%'
                },
                UserTypeID: 5
            }
        }).then(function(count) {
            //Find all users with params
            models.User.findAll({
                include: [{
                    model: models.WebstoreCompany,
                    include: [
                        {model: models.UserAddress}
                        ]
                    }
                ],
                limit: req.body.count,
                offset: req.body.offset,
                where: {
                    FirstName: {
                        $like: '%'+req.body.search+'%'
                    },
                    UserTypeID: 5
                },
                order: [['FirstName', 'ASC'], ['LastName', 'ASC']]
            })
            .then(function(webstores) {
                return res.status(200).json({
                    webstores: webstores,
                    count: count
                });
            });
        })      
    });

    //Shows one single webstore
    router.get('/one',  function(req, res, next){
        //Find User
        models.User.findOne({
            include: [{
                model: models.WebstoreCompany,
                include: [
                    {model: models.Hubs},
                    {model: models.UserAddress}
                ]
            }],
            where: {UserID: req.query._id}
        })
        .then(function(user) {
            var hasWebstoreCompany = user.dataValues.WebstoreCompany !== null ? true : false
            var hasHub = false
            var hasAddress = false
            if (hasWebstoreCompany) {
                var hasHub = user.dataValues.WebstoreCompany.dataValues.HubID !== null ? true : false
                var hasAddress = user.dataValues.WebstoreCompany.dataValues.UserAddressID !== null ? true : false
            }
            return res.status(200).json({
                User: user,
                hasHub: hasHub,
                hasAddress: hasAddress
            });
        });
    });

    //Create single webstore
    router.post('/create',  function(req, res, next){
        try {
            req.body.Password = crypto.createHash('md5').update(req.body.Password).digest("hex");
            //Create User
            models.User.create(req.body).then(function(user) {
                //Create User Login
                models.UserLogins.create({
                    LoginKeyword: user.Email,
                    Password: req.body.Password,
                    UserID: user.UserID
                }).then(function(userLogin) {
                    //Create User Address
                    models.UserAddress.create(req.body.UserAddress).then(function(address){
                        //Create WebstoreCompany
                        models.WebstoreCompany.create({
                            HubID: req.body.HubID,
                            UserID: user.UserID,
                            UserAddressID: address.UserAddressID
                        }).then(function(webstore) {
                            return res.status(200).json({
                                status:true,
                                data: user
                            });
                        })
                    })
                })
            })
        } catch (e) {
            console.error(e.stack)
            console.log('Error in create webstore: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        }
    });


    //Update single webstore
    router.post('/update',  function(req, res, next){      
        console.log('body', req.body);  
        try {
            if (req.body.Password) {
                req.body.Password = crypto.createHash('md5').update(req.body.Password).digest("hex");
            }
            //Find User
            models.User.findOne({
                include: [
                    {model: models.UserLogins}
                ],
                where: {
                    UserID: req.body.UserID
                }
            })
            .then(function(user) {
                //Update User
                user.update(req.body).then(function(user) {
                    req.body.LoginKeyword = user.Email
                    //Update UserLogin
                    user.dataValues.UserLogin.update(req.body, {
                        fields: ['LoginKeyword', 'Password']
                    }).then(function(user) {
                        //Create UserAddress
                        models.UserAddress.create(req.body.UserAddress).then(function(address){
                            //Find or Create Webstore Company
                            models.WebstoreCompany.findOrCreate({
                                where: {
                                    UserID: req.body.UserID
                                }
                            }).spread(function(webstore, created) {
                                //Update webstore if found
                                webstore.update({
                                    HubID: req.body.HubID,
                                    UserAddressID: address.UserAddressID,
                                    AllowCOD: req.body.AllowCOD,
                                }).then(function(webstore) {
                                    return res.status(200).json({
                                        data:user,
                                        status: true
                                    });
                                })
                            })
                        })
                    })
                })
            });
        } catch (e) {
            console.error(e.stack)
            console.log('Error in update webstore: ', e);
            return res.json({
                status: false,
                description: e
            }, 403);
        }
    });

    return router;
};