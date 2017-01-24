'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mainCtrl = require('../lib/mainCtrl');

var _mainCtrl2 = _interopRequireDefault(_mainCtrl);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Post = _mongoose2.default.model('Post');
const Contact = _mongoose2.default.model('Contact');
const router = _express2.default.Router();

module.exports = app => {
    app.use('/api/home', router);
};

class HomeCtrl extends _mainCtrl2.default {
    index(req, res, next) {
        return _asyncToGenerator(function* () {
            let query = req.query;
            let [posts, count, skip, limit, orderBy, orderDirection] = yield Post.FindAllAndCount({ query, home: true });
            res.status(200).json({
                count, skip, limit, orderBy, orderDirection, posts
            });
        })();
    }

    contact(req, res, next) {
        return _asyncToGenerator(function* () {
            const contact = yield Contact.create(req.body);
            res.status(201).json({ success: 1, message: 'mesage received!' });
        })();
    }

}
const ctrl = new HomeCtrl();
ctrl.contact.required = ['email', 'name', 'subject', 'message'];
router.route("/").get(ctrl.errorHandler(ctrl.index))
//    .post(ctrl.checkReq(), ctrl.errorHandler(ctrl.create))
.all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/contact").post(ctrl.checkReq({ check: true, action: 'contact' }), ctrl.errorHandler(ctrl.contact));