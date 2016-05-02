"use strict";

module.exports = function(sequelize, DataTypes) {
	var State = sequelize.define("State", {
		StateID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		CountryID: DataTypes.STRING,
		Name: DataTypes.STRING,
		ShortCode: DataTypes.STRING
	}, {
		tableName: 'States',
		timestamps: false,
		classMethods: {
            associate: function (models) {
                State.hasMany(models.City, {
                    foreignKey: 'StateID',
                });
            }
        }
	});

	return State;
};