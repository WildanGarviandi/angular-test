"use strict";

module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define("User", {
		UserID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		UserTypeID: DataTypes.INTEGER,
		FirstName: DataTypes.STRING,
		LastName: DataTypes.STRING,
		ProfilePicture: DataTypes.STRING,
		ProfilePicture1: DataTypes.STRING
	}, {
		tableName: 'Users',
		timestamp: true,
		createdAt: 'CreatedDate',
		updatedAt: 'ModifiedDate'
	});

	return User;
};
