var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
    router.get('/',  function(req, res, next){
        models.OrderStatus.findAndCountAll().then(function(status) {
            return res.status(200).json({
                status: status
            });
        }); 
    });

    return router;
};