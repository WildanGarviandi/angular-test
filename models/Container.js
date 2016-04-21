'use strict';

module.exports = function(sequelize, DataTypes) {
    var Container = sequelize.define('Container', {
        ContainerID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ContainerNumber: DataTypes.STRING,
        HubID: DataTypes.INTEGER,
        Active: DataTypes.BOOLEAN
    }, {
        tableName: 'Containers',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return Container;
};