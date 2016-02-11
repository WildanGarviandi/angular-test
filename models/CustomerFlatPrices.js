"use strict";

module.exports = function(sequelize, DataTypes) {
    var CustomerFlatPrices = sequelize.define("CustomerFlatPrices", {
        CustomerFlatPriceID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        WebstoreUserID: DataTypes.INTEGER,
        MaxWeight: DataTypes.INTEGER,
        MaxDimension1: DataTypes.INTEGER,
        MaxDimension2: DataTypes.INTEGER,
        MaxDimension3: DataTypes.INTEGER,
        MaxCBM: DataTypes.INTEGER,
        Price: DataTypes.DECIMAL,
        PickupType: DataTypes.INTEGER,
        LogisticShare: DataTypes.DECIMAL,
        OurShare: DataTypes.DECIMAL,
        DriverShare: DataTypes.DECIMAL,
        PickupType: DataTypes.INTEGER,
        VehicleID: DataTypes.INTEGER
    }, {
        tableName: 'CustomerFlatPrices',
        timestamp: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return CustomerFlatPrices;
};
