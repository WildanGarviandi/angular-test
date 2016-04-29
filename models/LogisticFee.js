"use strict";

module.exports = function (sequelize, DataTypes) {
    var LogisticFee = sequelize.define('LogisticFee', {
        LogisticFeeID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        FleetManagerID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        VehicleID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        PricePerKM: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        MinimumFee: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        PerItemFee: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        }
    },{
        tableName: 'LogisticFees',
        timestamp: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return LogisticFee;
};