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

const Category = _mongoose2.default.model('Category');
const router = _express2.default.Router();

module.exports = app => {
    app.use('/api/categories', router);
};

class CategoryCtrl extends _mainCtrl2.default {
    index(req, res, next) {
        return _asyncToGenerator(function* () {
            let categories = yield Category.find({});
            res.status(200).json({
                success: 1, categories
            });
        })();
    }
    create(req, res, next) {
        return _asyncToGenerator(function* () {
            const category = yield Category.create(req.body);
            res.status(201).json({ success: 1, category });
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
            console.log("id: ", id);
            const comment = yield Comment.findByIdAndRemove(id);
            res.status(204).json({ comment });
        })();
    }

    findPosts(req, res, next) {
        return _asyncToGenerator(function* () {
            let query = req.query;
            const id = req.params.id;
            console.log("slug : ", req.query.slug);
            const [posts, skip, limit, orderBy, orderDirection, count] = yield Category.FindAllPostAndCountByCategory({ id, query });
            //let [posts, count, skip, limit, orderBy, orderDirection] = await Category.FindAllAndCountByCategory({ query });

            res.status(200).json({ success: 1, posts, skip, limit, orderBy, orderDirection, count });
        })();
    }

}
const ctrl = new CategoryCtrl();
//ctrl.reservedKeys = ['comments', 'user','postId', ...ctrl.defaultReservedKeys()]
//ctrl.adminOnly['create']

router.route("/").get(ctrl.errorHandler(ctrl.index)).post(_authCheck.Auth.checkAuth('Admin'), ctrl.errorHandler(ctrl.create)).all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/:id").all(ctrl.checkId('mongo', 'slug')).get(ctrl.errorHandler(ctrl.find)).all(ctrl.checkId('mongo'))
//.put(errorChecking(checkReservedParams(update, "id", "createdAt", "updatedAt")))
.delete(_authCheck.Auth.checkAuth(['Admin']), ctrl.errorHandler(ctrl.destroy));
//.all(errorChecking(notAllowed));    */

router.route('/:id/posts').all(ctrl.checkId('mongo', 'slug')).get(ctrl.errorHandler(ctrl.findPosts));