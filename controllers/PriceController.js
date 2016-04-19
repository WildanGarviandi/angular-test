var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {
    router.post('/logistic',  function(req, res, next){
        var params = {
            FleetManagerID: req.body.FleetManagerID
        };
        if (req.body.VehicleID) {
            params.VehicleID = req.body.VehicleID;
        }
        models.LogisticFee.findAll({
            where: params,
            order: [['VehicleID', 'ASC']]
        })
        .then(function(fees) {
            return res.status(200).json({
                fees: fees
            });
        });
    });

    router.post('/logistic/update',  function(req, res, next){
        models.LogisticFee.findOrCreate({
            where: {
                FleetManagerID: req.body.FleetManagerID,
                VehicleID: req.body.VehicleID
            },
            defaults: {
                PricePerKM: req.body.PricePerKM,
                MinimumFee: req.body.MinimumFee,
                PerItemFee: req.body.PerItemFee
            }
        })
        .then(function (data) {
            console.log(data[0]);
            models.LogisticFee.update({
                PricePerKM: req.body.PricePerKM,
                MinimumFee: req.body.MinimumFee,
                PerItemFee: req.body.PerItemFee
            }, {
                where: {
                    LogisticFeeID: data[0].LogisticFeeID
                }
            })
            .then(function (result) {
                return res.status(200).json({
                    result: result
                }); 
            });
        });
    });

    router.post('/customer',  function(req, res, next){
        models.CustomerFlatPrices.findAll({
            where: {PickupType: req.body.PickupType, WebstoreUserID: req.body.WebstoreUserID},
            order: [['MaxWeight', 'ASC'], ['MaxCBM', 'ASC']]
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

    router.get('/vehicles', function (req, res, next) {
        models.Vehicle.findAll().then(function (result) {
            return res.status(200).json({
                vehicles: result
            });
        })
        .catch(function (error) {
            console.log('vehicle error', error);
            return res.status(500).json({
                error: error
            });
        });
    });


    /**
     * Save customer flat prices
     * 
     * @return {void}
     */
    function saveCustomerPrices(req, vehiclePrices) {
        vehiclePrices.forEach(function(y) {
            if (y.Price) {
                models.CustomerFlatPrices.findOrCreate({
                    where: {
                        WebstoreUserID: req.body.WebstoreUserID, 
                        PickupType: req.body.PickupType, 
                        MaxWeight: y.MaxWeight, 
                        MaxCBM: y.MaxCBM, 
                        VehicleID: y.VehicleID
                    }
                })
                .spread(function(price, created) {
                    price.update(y).then(function(data) {
                        
                    })
                })
            }
        });
    }

    /**
     * Save logistic flat prices
     * 
     * @return {void}
     */
    function saveLogisticPrices(req, vehiclePrices) {
        vehiclePrices.forEach(function(y) {
            if (y.Price) {
                models.LogisticFlatPrices.findOrCreate({
                    where: {
                        CompanyDetailID: req.body.CompanyDetailID, 
                        PickupType: req.body.PickupType, 
                        MaxWeight: y.MaxWeight,
                        MaxCBM: y.MaxCBM, 
                        VehicleID: y.VehicleID
                    }
                })
                .spread(function(price, created) {
                    price.update(y).then(function(data) {
                        
                    })
                })
            }
        });
    }

    return router;
};