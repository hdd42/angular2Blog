'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mainCtrl = require('../lib/mainCtrl');

var _mainCtrl2 = _interopRequireDefault(_mainCtrl);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const User = _mongoose2.default.model('User');
const Post = _mongoose2.default.model('Post');
const router = _express2.default.Router();

module.exports = app => {
    //app.use('/api/users', passport.authenticate('jwt', { session: false }))
    app.use('/api/users', router);
};

class UserCtrl extends _mainCtrl2.default {
    index(req, res, next) {
        return _asyncToGenerator(function* () {
            let [users, count, skip, limit, orderBy, orderDirection] = yield User.FindAllAndCount(req.query);
            res.status(200).json({
                count, skip, limit, orderBy, orderDirection, users
            });
        })();
    }
    create(req, res, next) {
        return _asyncToGenerator(function* () {
            const instance = yield User.create(req.body);
            res.status(201).json({ data: instance });
        })();
    }

    posts(req, res, next) {
        return _asyncToGenerator(function* () {
            let query = req.query;
            let userId = req.user._id;
            console.log(userId);
            let [posts, count, skip, limit, orderBy, orderDirection] = yield Post.FindAllAndCount({ query, home: true, userId });
            res.status(200).json({
                count, skip, limit, orderBy, orderDirection, posts
            });
        })();
    }

    update(req, res, next) {
        return _asyncToGenerator(function* () {
            let userId = req.params.id;
            const user = yield User.findByIdAndUpdate(userId, req.body);
            if (!user) return res.status(404).json({ success: 0, message: `no user found with id : ${ userId }` });
            res.status(200).json({ message: `User with id: '${ userId }' updated!`, success: 1 });
        })();
    }
    destroy(req, res, next) {
        return _asyncToGenerator(function* () {

            let userId = req.params.id;
            const user = yield User.findByIdAndUpdate(userId, { $set: { deletedAt: Date.now() } });
            if (!user) return res.status(404).json({ success: 0, message: `no user found with id : ${ userId }` });
            res.status(200).json({ success: 1, message: `User with id: '${ userId }' deleted!` });
        })();
    }

}
const ctrl = new UserCtrl();
ctrl.reservedKeys = ['ali'];

router.route("/").get(ctrl.errorHandler(ctrl.index)).post(ctrl.checkReq(), ctrl.errorHandler(ctrl.create)).all(ctrl.errorHandler(ctrl.notAllowed));
router.route("/:id")
//.get(ctrl.errorHandler(ctrl.index))
.put(ctrl.checkReq(), ctrl.errorHandler(ctrl.update)).delete(ctrl.errorHandler(ctrl.destroy)).all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/posts").get(ctrl.errorHandler(ctrl.posts))
//.post(ctrl.checkReq(), ctrl.errorHandler(ctrl.create))
.all(ctrl.errorHandler(ctrl.notAllowed));