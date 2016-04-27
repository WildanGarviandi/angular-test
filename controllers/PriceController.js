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

    router.get('/vehicles', function (req, res, next) {
        models.Vehicle.findAll().then(function (result) {
            return res.status(200).json({
                vehicles: result
            });
        })
        .catch(function (error) {
            return res.status(500).json({
                error: error
            });
        });
    });

    return router;
};