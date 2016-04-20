"use strict";

module.exports = function(sequelize, DataTypes) {
	var City = sequelize.define("City", {
		CityID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		Name: DataTypes.STRING,
		EcommercePriceReferenced: DataTypes.INTEGER
	}, {
		tableName: 'Cities',
		timestamps: false
	});

	return City;
};