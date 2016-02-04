var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var parsetrace = require('parsetrace');
var errorGenerator = require('../middlewares/error-generator');
var passport = require('passport');
var config = require('../config');

var app = express();

module.exports = function(di){

    app.set('port', di.config.port);
    app.use(logger('dev'));
    app.use(bodyParser.json({ limit:di.config.app.request_limit }));
    app.use(bodyParser.urlencoded({ extended: false, limit: di.config.app.request_limit }));
    app.use(expressValidator());
    app.use(cookieParser());
    app.use(express.static(path.join(config.root, 'client')));
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(passport.initialize());
    app.use(errorGenerator());


    // application route, exclude method OPTIONS
    app.use('/', function(req, res, next){
    if (req.method === 'OPTIONS'){
        res.send();
    } else {
        di.router(req, res, next);
    }
    })

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (di.config.app.debug) {
        app.use(function(err, req, res, next) {
            err.status = err.status || 500;
            res.status(err.status);
            var stacktrace = parsetrace(err).object();
            res.send({
                message: err.message,
                code: err.status,
                stacktrace: stacktrace.frames
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        err.status = err.status || 500;
        res.status(err.status);
        res.render('404', {
            message: err.message,
            code: err.status
        });
    });

    return app;
}
