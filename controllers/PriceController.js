var express   = require('express');
var models    = require('../models');
var _ = require('lodash');

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

        var functions = [];
        req.body.fees.forEach(function (fee) {
            var updateFunction = new Promise(function (resolve, reject) {
                models.LogisticFee.findOrCreate({
                    where: {
                        FleetManagerID: fee.FleetManagerID,
                        VehicleID: fee.VehicleID
                    },
                    defaults: {
                        PricePerKM: fee.PricePerKM,
                        MinimumFee: fee.MinimumFee,
                        PerItemFee: fee.PerItemFee
                    }
                })
                .then(function (feeFoundorCreated) {
                    return models.LogisticFee.update({
                        PricePerKM: fee.PricePerKM,
                        MinimumFee: fee.MinimumFee,
                        PerItemFee: fee.PerItemFee
                    }, {
                        where: {
                            LogisticFeeID: feeFoundorCreated[0].LogisticFeeID
                        }
                    });
                })
                .then(function (affectedRows) {
                    resolve(affectedRows[0]);
                });
            });
            functions.push(updateFunction);
        });
    
        Promise.all(functions).then(function (result) {
            var totalRowsAffected = 0;
            result.forEach(function (affectedRows) {
                totalRowsAffected += affectedRows;
            });

            if (totalRowsAffected == req.body.fees.length) {
                return res.status(200).json({
                    result: totalRowsAffected
                });
            } else {
                return res.status(500).json({
                    result: totalRowsAffected,
                    error: 'Some fees are not updated, please check again'
                });
            }
        }, function (error) {
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
            return res.status(500).json({
                error: error
            });
        });
    });


    return router;
};