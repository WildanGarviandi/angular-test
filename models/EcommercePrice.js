'use strict';

module.exports = function (sequelize, DataTypes) {
    var EcommercePrice = sequelize.define('EcommercePrice', {
        EcommercePriceID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        WebstoreUserID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        PickupType: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        VehicleID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        MaxWeight: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        OriginID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        DestinationID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        DiscountID: DataTypes.INTEGER,
        Price: DataTypes.FLOAT,
        AdditionalPrice: DataTypes.FLOAT
            
    }, {
        tableName: 'EcommercePrices',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate',
    });

    return EcommercePrice;
};