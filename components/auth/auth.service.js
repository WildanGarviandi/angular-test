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

exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
