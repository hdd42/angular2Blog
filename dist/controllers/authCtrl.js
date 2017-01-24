'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mainCtrl = require('../lib/mainCtrl');

var _mainCtrl2 = _interopRequireDefault(_mainCtrl);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _helpers = require('../lib/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const User = _mongoose2.default.model('User');
const router = _express2.default.Router();

module.exports = app => {
    app.use('/auth', router);
};

class AuthCtrl extends _mainCtrl2.default {
    create(req, res, next) {
        return _asyncToGenerator(function* () {
            const { email, password, name } = req.body;
            let user = yield User.create({ email, password, name });
            res.status(201).json({ success: 1, user: { email, name, _id: user._id, role: user.role } });
        })();
    }

    login(req, res, next) {
        return _asyncToGenerator(function* () {
            const { email, password } = req.body;
            console.log('email, passs : ', email, password);
            let user = yield User.findOne({ email }).select('email password _id role active name');
            if (!user) return res.status(404).json({ success: 0, message: `no user found with email : ${email}` });
            let loginCheck = yield user.comparePassword(password);
            if (!loginCheck) return res.status(404).json({ success: 0, message: `wrong email or password : ${email}` });
            let out = { _id: user._id, name: user.name, email: user.email, role: user.role, active: user.active };
            const token = yield (0, _helpers.createToken)({ _id: user._id, email: user.email });
            res.status(200).json({ success: 1, user: out, token });
        })();
    }

    checkEmail(req, res, next) {
        return _asyncToGenerator(function* () {
            let email = req.body.email;
            if (!email) return res.status(400).json({ success: 0, message: 'no email provided.' });
            let user = yield User.findOne({ email });
            if (!user) return res.status(200).json({ success: 1, message: 'no user found.' });
            return res.status(200).json({ success: 0, message: 'user found.' });
        })();
    }

    checkToken(req, res, next) {
        return _asyncToGenerator(function* () {
            let token = req.body.token;
            let result;
            try {
                result = yield (0, _helpers.validateToken)(token);
                return res.status(200).json({ success: 1, message: 'Token is Valid!', result });
            } catch (error) {
                return res.status(401).json({ success: 0, error });
            }

            if (!result) return res.status(401).json({ success: 0, message: 'Not a validat token' });
        })();
    }

}
const ctrl = new AuthCtrl();
ctrl.reservedKeys = ['role', 'active', ...ctrl.defaultReservedKeys()];
ctrl.create.required = ['email', 'name', 'password'];
ctrl.login.required = ['email', 'password'];
ctrl.checkToken.required = ['token'];

router.route("/register").post(ctrl.checkReq({ check: true, action: 'create' }), ctrl.errorHandler(ctrl.create)).put(ctrl.errorHandler(ctrl.checkEmail)).all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/login").post(ctrl.checkReq({ check: true, action: 'login' }), ctrl.errorHandler(ctrl.login)).all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/checkToken").post(ctrl.checkReq({ check: true, action: 'checkToken' }), ctrl.checkToken).all(ctrl.errorHandler(ctrl.notAllowed));