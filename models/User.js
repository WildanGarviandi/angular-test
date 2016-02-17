"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserTypeID: DataTypes.INTEGER,
        FirstName: DataTypes.STRING,
        LastName: DataTypes.STRING,
        ProfilePicture: DataTypes.STRING,
        ProfilePicture1: DataTypes.STRING,
        Email: DataTypes.STRING,
        Location: DataTypes.STRING,
        StatusID: DataTypes.INTEGER,
        DeviceTypeID: DataTypes.INTEGER,
        SourceID: DataTypes.INTEGER,
        RegistrationSourceKey: DataTypes.INTEGER,
        ReferrerTypeID: DataTypes.INTEGER,
        LastLoginDate: DataTypes.STRING,
        Latitude: DataTypes.DECIMAL,
        Longitude: DataTypes.DECIMAL,
        PhoneNumber: DataTypes.STRING,
        CountryCode: DataTypes.STRING,
        StateID: DataTypes.STRING,
        CityID: DataTypes.STRING,
        ZipCode: DataTypes.STRING
      
    }, {
        tableName: 'Users',
        timestamp: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return User;
};
