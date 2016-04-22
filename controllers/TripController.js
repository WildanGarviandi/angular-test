var express   = require('express');
var models    = require('../models');
var moment    = require('moment');

var router = express.Router();

module.exports = function(di) {
    models.Trip.belongsTo(models.OrderStatus, { foreignKey: 'Status' });
    models.Trip.belongsTo(models.UserAddress, { as: 'PickupAddress', foreignKey: 'PickupAddressID' });
    models.Trip.belongsTo(models.UserAddress, { as: 'DropoffAddress', foreignKey: 'DropoffAddressID' });
    models.Trip.belongsTo(models.User, { as: 'Driver', foreignKey: 'DriverID' });
    models.Trip.belongsTo(models.District, { foreignKey: 'DistrictID' });
    models.Trip.belongsTo(models.Container, {foreignKey: 'ContainerNumber', targetKey: 'ContainerNumber'});
    models.Trip.hasMany(models.UserOrderRoute, { foreignKey: 'TripID' });
    models.UserOrderRoute.belongsTo(models.UserOrder, { foreignKey: 'UserOrderID' });
    models.UserOrderRoute.belongsTo(models.OrderStatus, { foreignKey: 'Status' });
    models.UserOrderRoute.belongsTo(models.UserAddress, { as: 'PickupAddress', foreignKey: 'PickupAddressID' });
    models.UserOrderRoute.belongsTo(models.UserAddress, { as: 'DropoffAddress', foreignKey: 'DropoffAddressID' });
    models.UserOrderRoute.belongsTo(models.User, { as: 'FleetManager', foreignKey: 'FleetManagerID' });
    models.UserOrder.hasMany(models.UserOrderRoute, { foreignKey: 'UserOrderID' });
    models.UserOrder.belongsTo(models.OrderStatus, { foreignKey: 'OrderStatusID' });
    models.UserOrder.belongsTo(models.UserAddress, { as: 'PickupAddress', foreignKey: 'PickupAddressID' });
    models.UserOrder.belongsTo(models.UserAddress, { as: 'DropoffAddress', foreignKey: 'DropoffAddressID' });
    models.UserOrder.belongsTo(models.User, { as: 'User', foreignKey: 'UserID' });
    models.UserOrder.belongsTo(models.User, { as: 'WebstoreUser', foreignKey: 'WebstoreUserID' });
    models.UserOrder.belongsTo(models.User, { as: 'FleetManager', foreignKey: 'FleetManagerID' });

    router.get('/',  function(req, res, next){
        var params = req.query || {},
            limit = parseInt(params.limit) || 10,
            offset  = parseInt(params.offset) || 0,
            tripNumber = params.tripNumber,
            pickup = params.pickup,
            dropoff = params.dropoff,
            status = parseInt(params.status),
            containerNumber = params.containerNumber,
            district = params.district,
            driver = params.driver,
            startPickup = params.startPickup,
            endPickup = params.endPickup,
            startDropoff = params.startDropoff,
            endDropoff = params.endDropoff;

        var clause = {
            limit: parseInt(limit) || 10,
            offset: parseInt(offset) || 0,
            where: {}
        };
        var clausePickup = {
            model: models.UserAddress, 
            as: 'PickupAddress',
            required: false,
            where: {}
        };
        var clauseDropoff = {
            model: models.UserAddress, 
            as: 'DropoffAddress',
            required: false,
            where: {}
        };
        var clauseDistrict = {
            model: models.District,
            required: false,
            where: {}
        };
        var clauseDriver = {
            model: models.User,
            as: 'Driver',
            required: false,
            where: {}
        };
        var clauseStatus = {
            model: models.OrderStatus,
            required: false,
            where: {}
        };
        var clauseContainer = {
            model: models.Container,
            required: false,
            where: {}
        };

        if (tripNumber) {
            clause.where.tripNumber = {$like: '%' + tripNumber + '%'};
        }

        if (containerNumber) {
            clause.where.containerNumber = {$like: '%' + containerNumber + '%'};
        }

        if (status) {
            clause.where.Status = status;
        }

        if (startPickup && endPickup) {
            clause.where.PickupTime = { $gte: startPickup, $lte: endPickup };
        }

        if (startDropoff && endDropoff) {
            clause.where.DropoffTime = { $gte: startDropoff, $lte: endDropoff };
        }

        if (district) {
            clauseDistrict.required = true;
            clauseDistrict.where.Name = {$like: '%' + district + '%'};
        }

        if (pickup) {
            clausePickup.required = true;
            clausePickup.where.Address1 = {$like: '%' + pickup + '%'};
        }

        if (dropoff) {
            clauseDropoff.required = true;
            clauseDropoff.where.Address1 = {$like: '%' + dropoff + '%'};
        }

        if (driver) {
            clauseDriver.required = true;
            clauseDriver.where.$or = [
                {FirstName: {$like: '%' + driver + '%'}},
                {LastName: {$like: '%' + driver + '%'}}
            ];
        }

        clause.include = [
            clauseDropoff,
            clausePickup,
            clauseStatus,
            clauseDriver,
            clauseContainer,
            clauseDistrict
        ];
        
        
        models.Trip.findAndCountAll(clause)
        .then(function(trips) {
            return res.status(200).json({
                trips: trips,
                count: trips.count
            });
        });    
    });

    router.get('/:tripID',  function(req, res, next){
        var clause = {
            where: {
                TripID: req.params.tripID
            }
        };
        var clausePickup = {
            model: models.UserAddress, 
            as: 'PickupAddress',
            required: false,
            where: {}
        };
        var clauseDropoff = {
            model: models.UserAddress, 
            as: 'DropoffAddress',
            required: false,
            where: {}
        };
        var clauseDistrict = {
            model: models.District,
            required: false,
            where: {}
        };
        var clauseDriver = {
            model: models.User,
            as: 'Driver',
            required: false,
            where: {}
        };
        var clauseStatus = {
            model: models.OrderStatus,
            required: false,
            where: {}
        };
        var clauseContainer = {
            model: models.Container,
            required: false,
            where: {}
        };
        var clauseRoute = {
            model: models.UserOrderRoute,
            required: false,
            where: {},
            order: [['CreatedDate', 'DESC']],
            include: [{
                model: models.UserOrder,
                include: [{
                    model: models.OrderStatus
                }, {                    
                    model: models.UserAddress, 
                    as: 'DropoffAddress',
                }, {
                    model: models.UserAddress, 
                    as: 'PickupAddress',
                }, {
                    model: models.User,
                    as: 'User'
                }, {
                    model: models.User,
                    as: 'WebstoreUser'
                }]
            }, {
                model: models.OrderStatus
            }, {
                model: models.UserAddress,
                as: 'PickupAddress'
            }, {
                model: models.UserAddress,
                as: 'DropoffAddress'
            }, {
                model: models.User,
                as: 'FleetManager'
            }]
        };

        clause.include = [
            clauseDropoff,
            clausePickup,
            clauseStatus,
            clauseDriver,
            clauseRoute,
            clauseContainer,
            clauseDistrict
        ];        
        
        models.Trip.findOne(clause)
        .then(function(trip) {
            return res.status(200).json({
                trip: trip
            });
        });    
    });

    return router;
};