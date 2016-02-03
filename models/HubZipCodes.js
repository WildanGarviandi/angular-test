"use strict";

module.exports = function(sequelize, DataTypes) {
	var HubZipCodes = sequelize.define("HubZipCodes", {
		HubZipCodeID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		HubID: DataTypes.INTEGER,
		ZipCode: DataTypes.STRING
	}, {
		tableName: 'HubZipCodes',
		timestamp: true,
		createdAt: 'CreatedDate',
		updatedAt: 'ModifiedDate'
	});

	return HubZipCodes;
};
