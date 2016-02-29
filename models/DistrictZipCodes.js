"use strict";

module.exports = function(sequelize, DataTypes) {
    var DistrictZipCodes = sequelize.define("DistrictZipCodes", {
        DistrictZipCodeID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        DistrictID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            isNumeric: true,
        },
        ZipCode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [5,5]
            }
        }
    }, {
        tableName: 'DistrictZipCodes',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return DistrictZipCodes;
};