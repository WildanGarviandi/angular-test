"use strict";

module.exports = function(sequelize, DataTypes) {
	var Country = sequelize.define("Country", {
		CountryID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		Name: DataTypes.STRING
	}, {
		tableName: 'Countries',
		timestamps: false
	});

	return Country;
};