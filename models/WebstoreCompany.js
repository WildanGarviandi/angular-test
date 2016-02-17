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
        UserAddressID: DataTypes.INTEGER
    }, {
        tableName: 'WebstoreCompany',
        timestamps: false
    });

    return WebstoreCompany;
};
