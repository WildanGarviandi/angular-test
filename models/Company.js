"use strict";

module.exports = function(sequelize, DataTypes) {
	var CompanyDetail = sequelize.define("CompanyDetail", {
		CompanyDetailID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		CompanyName: DataTypes.STRING,
		FleetManagerID: DataTypes.STRING
	}, {
		tableName: 'CompanyDetail',
		timestamp: true,
		createdAt: 'CreatedDate',
		updatedAt: 'ModifiedDate'
	});

	return CompanyDetail;
};
