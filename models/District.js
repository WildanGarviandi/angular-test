"use strict";

module.exports = function(sequelize, DataTypes) {
	var Districts = sequelize.define("Districts", {
        DistrictID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING,
            validate: { 
                len: [0, 100],
                notEmpty: true
            }
        },
        City: {
            type: DataTypes.STRING,
            validate: { 
                len: [0, 100]
            }
        },
        Province: {
            type: DataTypes.STRING,
            validate: { 
                len: [0, 100]
            }
        }
    }, {
        tableName: 'Districts',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });
    
    return Districts;
};