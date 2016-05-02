"use strict";

module.exports = function(sequelize, DataTypes) {
	var City = sequelize.define("City", {
		CityID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		StateID: DataTypes.INTEGER,
		ShortCode: DataTypes.STRING,
		StateCode: DataTypes.STRING,
		Name: DataTypes.STRING
	}, {
		tableName: 'Cities',
		timestamps: false,
		classMethods: {
            associate: function (models) {
                City.belongsTo(models.State, {
                	foreignKey: 'StateID'});
            }
        }
	});

	return City;
};