var mssql = require('mssql');

module.exports = function(di) {
	var db = function(req, res, next) {
		return new mssql.Connection(di.config.mssql, next);
	};

	return db;
}