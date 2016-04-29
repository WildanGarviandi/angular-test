"use strict";

module.exports = function(sequelize, DataTypes) {
    var Vehicle = sequelize.define("Vehicle", {
        VehicleID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        Name: DataTypes.STRING,
        Description: DataTypes.STRING,
        MaxWeight: DataTypes.FLOAT,
        MaxVolume: DataTypes.FLOAT
    }, {
        tableName: 'Vehicles',
        timestamps: false
    });

    return Vehicle;
};
