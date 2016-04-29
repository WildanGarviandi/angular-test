"use strict";

module.exports = function(sequelize, DataTypes) {
    var WebstoreCompany = sequelize.define("WebstoreCompany", {
        WebstoreID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: DataTypes.INTEGER,
        HubID: DataTypes.INTEGER,
        UserAddressID: DataTypes.INTEGER,
        AllowCOD: DataTypes.BOOLEAN,
        Categories: DataTypes.STRING,
        PickupOptions: DataTypes.STRING,
        AverageWeights: DataTypes.STRING,
    }, {
        tableName: 'WebstoreCompany',
        timestamps: false
    });

    return WebstoreCompany;
};
