'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mainCtrl = require('../lib/mainCtrl');

var _mainCtrl2 = _interopRequireDefault(_mainCtrl);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _authCheck = require('../middlewares/authCheck');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Comment = _mongoose2.default.model('Comment');
const router = _express2.default.Router();

module.exports = app => {
    app.use('/api/comments', router);
};

class CommentCtrl extends _mainCtrl2.default {
    index(req, res, next) {
        return _asyncToGenerator(function* () {
            let query = req.query;
            let [comments, count, skip, limit, orderBy, orderDirection] = yield Comment.FindAllAndCount({ query });
            res.status(200).json({
                count, skip, limit, orderBy, orderDirection, comments
            });
        })();
    }
    create(req, res, next) {
        return _asyncToGenerator(function* () {
            const comment = yield Comment.create(req.body);
            yield Post.findByIdAndUpdate(id);
            res.status(201).json({ data: instance });
        })();
    }

    find(req, res, next) {
        return _asyncToGenerator(function* () {
            let query = req.query;
            const id = req.params.id;
            const comment = yield Comment.findById(id).populate({ path: 'user', select: 'name' });
            res.status(200).json({ success: 1, comment });
        })();
    }

    destroy(req, res, next) {
        return _asyncToGenerator(function* () {
            const id = req.params.id;
            const comment = yield Comment.findByIdAndRemove(id);
            res.status(204).json({ comment });
        })();
    }

}
const ctrl = new CommentCtrl();
ctrl.reservedKeys = ['comments', 'user', 'postId', ...ctrl.defaultReservedKeys()];

router.route("/").get(ctrl.errorHandler(ctrl.index)).all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/:id").all(ctrl.checkId('mongo')).get(ctrl.errorHandler(ctrl.find))
//.put(errorChecking(checkReservedParams(update, "id", "createdAt", "updatedAt")))
.delete(_authCheck.Auth.checkAuth(['Admin', 'Member']), ctrl.errorHandler(ctrl.destroy));
//.all(errorChecking(notAllowed));