"use strict";

module.exports = function(sequelize, DataTypes) {
	var District = sequelize.define("District", {
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
        },
        Latitude: DataTypes.FLOAT,
        Longitude: DataTypes.FLOAT
    }, {
        tableName: 'Districts',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate',
        classMethods: {
            associate: function (models) {
                District.hasMany(models.DistrictZipCode, {
                    foreignKey: 'DistrictID',
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE'
                });
            }
        }
    });
    
    return District;
};