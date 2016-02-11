var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
    //Logistic Flat Prices
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
        req.body.Prices.forEach(function(y) {
            models.LogisticFlatPrices.findOrCreate({where: 
            {CompanyDetailID: req.body.CompanyDetailID, PickupType: req.body.PickupType, MaxWeight: y.MaxWeight}})
            .spread(function(price, created) {
                price.update(y).then(function(data) {
                    
                })
            })
        });
        return res.status(200).json({
            status: true
        });     
    });

    //Customer Flat Prices
    router.post('/customer',  function(req, res, next){
        models.CustomerFlatPrices.findAll({
            where: {PickupType: req.body.PickupType, WebstoreUserID: req.body.WebstoreUserID},
            order: [['MaxWeight', 'ASC']]
        })
        .then(function(prices) {
            return res.status(200).json({
                prices: prices
            });
        });
    });

    router.post('/saveCustomer',  function(req, res, next){        
        saveCustomerPrices(req, req.body.Prices.bike)
        saveCustomerPrices(req, req.body.Prices.van)
        saveCustomerPrices(req, req.body.Prices.smalltruck)
        saveCustomerPrices(req, req.body.Prices.mediumtruck)
        return res.status(200).json({
            status: true
        });     
    });


    /**
     * Save customer flat prices
     * 
     * @return {void}
     */
    function saveCustomerPrices(req, vehiclePrices) {
        vehiclePrices.forEach(function(y) {
            models.CustomerFlatPrices.findOrCreate({where:{
                WebstoreUserID: req.body.WebstoreUserID, 
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