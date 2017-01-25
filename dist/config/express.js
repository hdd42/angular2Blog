'use strict';

const express = require('express');
const glob = require('glob');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const nunjucks = require('nunjucks');
const cors = require('cors');
const appKey = require('../middlewares/checkAppKey');
const passport = require('passport');
const jwtStrategy = require('../lib/passport').strategy;
const Auth = require('../middlewares/authCheck').Auth;
//const sorgu = require('../helpers/helper')

module.exports = function (app, config) {
    const env = process.env.NODE_ENV || 'development';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env == 'development';

    app.set('views', config.root + '/app/views');
    app.set('view engine', 'nunjucks');
    nunjucks.configure(config.root + '/app/views', {
        autoescape: true,
        express: app
    });

    app.set('json spaces', 3);
    if (env == 'development') {
        app.use(logger('dev'));
    } else {
        app.use(logger('compress'));
    }
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    /**
     * check if a request has an App-Key and Secret
     */
    // app.use('/api/*',appKey);
    app.use(passport.initialize());
    passport.use(jwtStrategy);

    app.use(cookieParser());

    if (env == 'development') {
        app.use(compress());
    }
    app.use(express.static(config.root + '/public/app'));
    app.use(methodOverride());

    //app.use('/api/*',passport.authenticate('jwt', { session: false }))
    app.use('/admin/*', Auth.checkAuth(['Admin']));

    const controllers = glob.sync(config.root + '/controllers/*.js');
    controllers.forEach(function (controller) {
        require(controller)(app);
    });
    //
    app.use(function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {

        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                'error': {
                    message: err.message,
                    error: err,
                    title: 'error'
                }
            });
        });
    }

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);

        res.json({
            'error': {
                message: err.message,
                error: {},
                title: 'error'
            }
        });
    });

    return app;
};