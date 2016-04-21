'use strict';

module.exports = function(sequelize, DataTypes) {
    var OrderStatus = sequelize.define('OrderStatus', {
        OrderStatusID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        OrderStatus: DataTypes.STRING
    }, {
        tableName: 'OrderStatusMaster',
        timestamps: false
    });

    return OrderStatus;
};