"use strict";

module.exports = function(sequelize, DataTypes) {
	var Districts = sequelize.define("Districts", {
        DistrictID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: DataTypes.STRING,
        City: DataTypes.STRING,
        Province: DataTypes.STRING
    }, {
        tableName: 'Districts',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });
    
    return Districts;
};