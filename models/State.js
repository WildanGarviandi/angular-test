"use strict";

module.exports = function(sequelize, DataTypes) {
	var State = sequelize.define("State", {
		StateID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		Name: DataTypes.STRING
	}, {
		tableName: 'States',
		timestamps: false
	});

	return State;
};