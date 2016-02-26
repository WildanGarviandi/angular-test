"use strict";

module.exports = function(sequelize, DataTypes) {
    var DistrictZipCodes = sequelize.define("DistrictZipCodes", {
        DistrictZipCodeID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        DistrictID: DataTypes.INTEGER,
        ZipCode: DataTypes.STRING
    }, {
        tableName: 'DistrictZipCodes',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return DistrictZipCodes;
};