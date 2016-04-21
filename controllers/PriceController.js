var express   = require('express');
var models    = require('../models');

var router = express.Router();

module.exports = function(di) {

    router.post('/ecommerce', function (req, res) {
        var params = {
            WebstoreUserID: req.body.WebstoreUserID, 
            PickupType: req.body.PickupType,
            VehicleID: req.body.VehicleID,
            MaxWeight: req.body.MaxWeight,
            DiscountID: req.body.DiscountID
        };
        models.EcommercePrice.findAll({
            where: params,
            order: [['OriginID', 'ASC'], ['DestinationID', 'ASC']]
        })
        .then(function (prices) {
            return res.status(200).json({
                prices: prices
            });
        })
        .catch(function (error) {
            console.log('ecommerce error', error);
            return res.status(500).json({
                error: error
            });
        });
    });

    router.post('/ecommerce/save', function (req, res) {
        models.EcommercePrice.findOrCreate({
            where: {
                WebstoreUserID: req.body.WebstoreUserID,
                PickupType: req.body.PickupType,
                VehicleID: req.body.VehicleID,
                OriginID: req.body.OriginID,
                DestinationID: req.body.DestinationID
            },
            defaults: {
                MaxWeight: 0,
                Price: 0
            }
        })
        .then(function (data) {
            models.EcommercePrice.update(req.body, {
                where : {
                    EcommercePriceID: data[0].EcommercePriceID
                }
            }).then(function (result) {
                res.status(200).json({
                    result: result
                });
            })
            .catch(function (error) {
                console.log('ecommerce error', error);
                return res.status(500).json({
                    error: error
                });
            });
        })
        .catch(function (error) {
            console.log('ecommerce error', error);
            return res.status(500).json({
                error: error
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
            console.log('vehicle error', error);
            return res.status(500).json({
                error: error
            });
        });
    });

    return router;
};