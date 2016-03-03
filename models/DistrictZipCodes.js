"use strict";

module.exports = function(sequelize, DataTypes) {
    var DistrictZipCode = sequelize.define("DistrictZipCode", {
        DistrictZipCodeID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        updatedAt: 'ModifiedDate',
        classMethods: {
            associate: function (models) {
                DistrictZipCode.belongsTo(models.District, {foreignKey: 'DistrictID'});
            }
        }
    });

    return DistrictZipCode;
};