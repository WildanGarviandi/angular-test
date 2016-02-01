'use strict';

var passport = require('passport');
var config = require('../../config');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var async = require('async');

var validateJwt = expressJwt({
  secret: config.secret_codes
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
/*function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, done) {
      console.log('Try to attach user to request. Now user is ', req.user.loginSessionKey);
      if (req.user.loginSessionKey) {
        done();
      } else {
        done({
          message: 'Problem with current user'
        }, null);
      }
    });
}*/

/**
 * Checks if the user role meets the minimum requirements of the route
 */
/*function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      } else {
        res.send(403);
      }
    });
}*/

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(user) {
  return jwt.sign({
    _id: user.Email,
    loginSessionKey: user.LoginSessionKey,
    user: user
  }, config.secret_codes, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.json(404, {
    message: 'Something went wrong, please try again.'
  });
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

//exports.isAuthenticated = isAuthenticated;
//exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
