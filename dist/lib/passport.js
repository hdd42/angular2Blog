"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.strategy = undefined;

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _config = require("../config/config");

var _config2 = _interopRequireDefault(_config);

var _passportJwt = require("passport-jwt");

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const User = _mongoose2.default.model('User');

const options = {
    jwtFromRequest: _passportJwt.ExtractJwt.fromAuthHeader(),
    secretOrKey: _config2.default.secret
};

const strategy = exports.strategy = new _passportJwt.Strategy(options, (jwt_payload, done) => {
    const id = jwt_payload.data._id;
    User.findById(id).then(_user => {
        if (!_user) return done(null, false);
        done(null, _user);
    }).catch(err => done(err, false));
});