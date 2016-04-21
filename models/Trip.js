"use strict";

module.exports = function(sequelize, DataTypes) {
    var Trip = sequelize.define("Trip", {
        TripID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        TripNumber: DataTypes.STRING,
        DriverID: DataTypes.INTEGER,
        PickupAddressID: DataTypes.INTEGER,
        DropoffAddressID: DataTypes.INTEGER,
        PickupTime: DataTypes.DATE,
        DropoffTime: DataTypes.DATE,
        Distance: DataTypes.DECIMAL,
        ETADelivery: DataTypes.INTEGER,
        ContainerNumber: DataTypes.INTEGER,
        Status: DataTypes.INTEGER,
        IsMultipleDropoff: DataTypes.BOOLEAN,
        DistrictID: DataTypes.INTEGER
    }, {
        tableName: 'Trips',
        timestamps: false
    });

    return Trip;
};