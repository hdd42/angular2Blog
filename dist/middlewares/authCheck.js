'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const passport = require('passport');

class Auth {
    static checkAuth(roles = ['Member']) {
        return (req, res, next) => {
            passport.authenticate('jwt', { session: false }, (err, user, info) => {

                if (err) {
                    return next(new Error("Something unexpteced happened ! sorry!"));
                }
                if (info || !user) {
                    let error = new Error('Not Authorized . No token found or invalid token!');
                    error.status = 401;
                    return next(error);
                }
                if (user.role == 'Admin') {
                    req.user = user;
                    return next();
                }
                if (roles.indexOf(user.role) < 0) {
                    let error = new Error(`Not Authorized . ${roles} Access Only!`);
                    error.status = 401;
                    return next(error);
                }
                req.user = user;
                next();
            })(req, res, next);
        };
    }
}
exports.Auth = Auth;