"use strict";

module.exports = function(sequelize, DataTypes) {
    var LogisticFlatPrices = sequelize.define('LogisticFlatPrices', {
        LogisticFlatPriceID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CompanyDetailID: DataTypes.INTEGER,
        MaxWeight: DataTypes.INTEGER,
        MaxDimension1: DataTypes.INTEGER,
        MaxDimension2: DataTypes.INTEGER,
        MaxDimension3: DataTypes.INTEGER,
        MaxCBM: DataTypes.INTEGER,
        Price: DataTypes.DECIMAL,
        LogisticShare: DataTypes.DECIMAL,
        OurShare: DataTypes.DECIMAL,
        DriverShare: DataTypes.DECIMAL,
        PickupType: DataTypes.INTEGER,
        VehicleID: DataTypes.INTEGER
    }, {
        tableName: 'LogisticFlatPrices',
        timestamp: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return LogisticFlatPrices;
};
