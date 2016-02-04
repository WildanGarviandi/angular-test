var express   = require('express');
var models    = require('../models');
var auth = require('../components/auth/auth.service');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var router = express.Router();

passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
	}, function(username, password, done) {
	password = crypto.createHash('md5').update(password).digest("hex");
	models.UserLogins.belongsTo(models.User, {foreignKey: 'UserID'})
	models.UserLogins.findOne({
		include: [{
        	model: models.User,
        	where: {UserTypeID: 5}
    	}],
		where: {
			LoginKeyword: username,
			Password: password
		}
	})
	.then(function(user) {	 
		done(user.dataValues.User.dataValues);
	})
	.catch(function(error){
		done(error);
	});
}))

module.exports = function(di) {
	router.post('/local', function(req, res, next) {
	  	passport.authenticate('local', function(user) {
		    if (!user.UserID) {
		      	return res.status(404).json({
		        	message: 'Incorrect credentials'
		      	});
		    }
		    var token = auth.signToken(user);
		    req.user = user;
		    res.status(200).json({
		      	userID: user.UserID,
		      	token: token
		    });
	  	})(req, res, next)
	});

	return router;
};