"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var config    = require('../config');
var db        = {};

var sequelize = new Sequelize(
  config.mssql.database,
  config.mssql.user,
  config.mssql.password,
  {
    host: config.mssql.host,
    dialect: 'mssql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;