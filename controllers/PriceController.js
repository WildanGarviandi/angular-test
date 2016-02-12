var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
    router.post('/logistic',  function(req, res, next){
        models.LogisticFlatPrices.findAll({
            where: {PickupType: req.body.PickupType, CompanyDetailID: req.body.CompanyDetailID},
            order: [['MaxWeight', 'ASC']]
        })
        .then(function(prices) {
            return res.status(200).json({
                prices: prices
            });
        });
    });

    router.post('/saveLogistic',  function(req, res, next){
        saveLogisticPrices(req, req.body.Prices.bike)
        saveLogisticPrices(req, req.body.Prices.van)
        saveLogisticPrices(req, req.body.Prices.smalltruck)
        saveLogisticPrices(req, req.body.Prices.mediumtruck)
        return res.status(200).json({
            status: true
        });     
    });

    router.post('/customer',  function(req, res, next){
        models.CustomerFlatPrices.findAll({
            where: {PickupType: req.body.PickupType},
            order: [['MaxWeight', 'ASC']]
        })
        .then(function(prices) {
            return res.status(200).json({
                prices: prices
            });
        });
    });

    router.post('/saveCustomer',  function(req, res, next){
        req.body.Prices.forEach(function(y) {
            models.CustomerFlatPrices.findOrCreate({where: 
            {PickupType: req.body.PickupType, MaxWeight: y.MaxWeight}})
            .spread(function(price, created) {
                price.update(y).then(function(data) {
                    
                })
            })
        });
        return res.status(200).json({
            status: true
        });     
    });

    /**
     * Save logistic flat prices
     * 
     * @return {void}
     */
    function saveLogisticPrices(req, vehiclePrices) {
        vehiclePrices.forEach(function(y) {
            models.LogisticFlatPrices.findOrCreate({where:{
                CompanyDetailID: req.body.CompanyDetailID, 
                PickupType: req.body.PickupType, 
                MaxWeight: y.MaxWeight,
                MaxCBM: y.MaxCBM, 
                VehicleID: y.VehicleID
            }})
            .spread(function(price, created) {
                price.update(y).then(function(data) {
                    
                })
            })
        });
    }

    return router;
};