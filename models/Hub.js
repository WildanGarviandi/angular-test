"use strict";

module.exports = function(sequelize, DataTypes) {
	var Hubs = sequelize.define("Hubs", {
		HubID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		Name: DataTypes.STRING,
		Type: DataTypes.STRING,
		Latitude: DataTypes.DECIMAL,
		Longitude: DataTypes.DECIMAL,
		Address1: DataTypes.STRING,
		Address2: DataTypes.STRING,
		City: DataTypes.STRING,
		State: DataTypes.STRING,
		Country: DataTypes.STRING,
		ZipCode: DataTypes.STRING,
		CountryCode: DataTypes.STRING,
		CityID: DataTypes.INTEGER,
		StateID: DataTypes.INTEGER,
		CountryID: DataTypes.INTEGER
	}, {
		tableName: 'Hubs',
		timestamp: true,
		createdAt: 'CreatedDate',
		updatedAt: 'ModifiedDate'
	});

	return Hubs;
};
