"use strict";

module.exports = function(sequelize, DataTypes) {
	var UserLogins = sequelize.define("UserLogins", {
		UserID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		LoginKeyword: DataTypes.STRING,
		Password: DataTypes.STRING
	}, {
		tableName: 'UserLogins',
		timestamp: true,
		createdAt: 'CreatedDate',
		updatedAt: 'ModifiedDate'
	});

	return UserLogins;
};