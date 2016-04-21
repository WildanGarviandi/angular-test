'use strict';

module.exports = function(sequelize, DataTypes) {
    var UserOrderRoute = sequelize.define('UserOrderRoute', {
        UserOrderRouteID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Sequence: DataTypes.INTEGER,
        UserOrderID: DataTypes.INTEGER,
        TripID: DataTypes.INTEGER,
        FleetManagerID: DataTypes.INTEGER,
        PickupAddressID: DataTypes.INTEGER,
        DropoffAddressID: DataTypes.INTEGER,
        PickupTime: DataTypes.DATE,
        DropoffTime: DataTypes.DATE,
        Distance: DataTypes.DECIMAL,
        ETADelivery: DataTypes.INTEGER,
        DeliveryFee: DataTypes.INTEGER,
        NetMargin: DataTypes.INTEGER,
        Status: {
            type: DataTypes.INTEGER,
            roles: false
        }
    }, {
        tableName: 'UserOrderRoutes',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return UserOrderRoute;
};