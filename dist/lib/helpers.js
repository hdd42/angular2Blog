'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createGuestUser = exports.validateToken = exports.createToken = exports.checkMongoId = undefined;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _config = require('../config/config');

var _config2 = _interopRequireDefault(_config);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const User = _mongoose2.default.model('User');
const ObjectId = require('mongoose').Types.ObjectId;

const checkMongoId = exports.checkMongoId = id => {
    let stringId = id.toString().toLowerCase();

    if (!ObjectId.isValid(stringId)) {
        return false;
    }

    let result = new ObjectId(stringId);
    if (result.toString() != stringId) {
        return false;
    }

    return true;
};

const createToken = exports.createToken = payload => {
    return new Promise((resolve, reject) => {
        try {
            let token = _jsonwebtoken2.default.sign({
                data: payload
            }, _config2.default.secret, { expiresIn: '3h' });

            resolve(token);
        } catch (error) {

            reject(error);
        }
    });
};

const validateToken = exports.validateToken = (() => {
    var _ref = _asyncToGenerator(function* (token) {
        let decoded;
        return new Promise(function (resolve, reject) {
            try {
                decoded = _jsonwebtoken2.default.verify(token, _config2.default.secret);
                resolve(decoded);
            } catch (error) {
                reject(error);
            }
        });
    });

    return function validateToken(_x) {
        return _ref.apply(this, arguments);
    };
})();

const createGuestUser = exports.createGuestUser = (() => {
    var _ref2 = _asyncToGenerator(function* () {
        try {
            const user = yield User.findOne({ email: 'guest@email.com' });
            if (user) return true;
            const newUser = yield User.create({
                email: 'guest@email.com',
                name: 'Guest',
                password: 'derbeder'
            });
            return true;
        } catch (error) {
            console.log('Error while creating guest!!!');
            return false;
        }
    });

    return function createGuestUser() {
        return _ref2.apply(this, arguments);
    };
})();