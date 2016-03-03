"use strict";

module.exports = function(sequelize, DataTypes) {
    var UserAddress = sequelize.define("UserAddress", {
        UserAddressID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: DataTypes.INTEGER,
        FirstName: DataTypes.STRING,
        LastName: DataTypes.STRING,
        Address1: DataTypes.STRING,
        MobileNumber: DataTypes.STRING,
        Latitude: DataTypes.DECIMAL,
        Longitude: DataTypes.DECIMAL,
        Country: DataTypes.STRING,
        State: DataTypes.STRING,
        City: DataTypes.STRING,
        ZipCode: DataTypes.STRING
      
    }, {
        tableName: 'UserAddress',
        timestamp: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return UserAddress;
};
