var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
    //Shows all companies
    router.get('/all',  function(req, res, next){
        models.User.findAll({
            where: {UserTypeID: 5},
            order: [['FirstName', 'ASC']]
        })
        .then(function(webstores) {
            return res.status(200).json({
                webstores: webstores
            });
        }); 
    });

    return router;
};