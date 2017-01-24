'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mainCtrl = require('../lib/mainCtrl');

var _mainCtrl2 = _interopRequireDefault(_mainCtrl);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _authCheck = require('../middlewares/authCheck');

var _helpers = require('../lib/helpers');

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Post = _mongoose2.default.model('Post');
const Comment = _mongoose2.default.model('Comment');
const User = _mongoose2.default.model('User');
const router = _express2.default.Router();

module.exports = app => {
    app.use('/api/posts', router);
    app.use('/api/user/:userId/posts', ctrl.findPostByUser);
};

class PostCtrl extends _mainCtrl2.default {
    index(req, res, next) {
        return _asyncToGenerator(function* () {
            let query = req.query;
            let [posts, count, skip, limit, orderBy, orderDirection] = yield Post.FindAllAndCount({ query });
            res.status(200).json({
                count, skip, limit, orderBy, orderDirection, posts
            });
        })();
    }
    create(req, res, next) {
        return _asyncToGenerator(function* () {
            req.body.user = req.user._id;
            req.body.comments = [];
            const post = yield Post.create(req.body);
            res.status(201).json({ success: 1, post });
        })();
    }

    find(req, res, next) {
        return _asyncToGenerator(function* () {
            let query = req.query;
            const id = req.params.id;
            let [post, commentCount, skip, limit, orderBy, orderDirection, slug] = yield Post.FindByIdOrSlugWithComment(id, query);

            if (post) {

                return res.json({ success: 1, post, commentCount, skip, limit, orderBy, orderDirection });
            } else {
                return res.status(404).json({ success: 0, error: `Post Not found with id : ${id} or slug : ${slug}` });
            }
        })();
    }

    update(req, res, next) {
        return _asyncToGenerator(function* () {
            const id = req.params.id;
            let post;

            if (req.user.role == 'Admin') {
                post = yield Post.findByIdAndUpdate(id, req.body, { new: true });
            } else {
                post = yield Post.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, { new: true });
            }
            if (!post) return res.status(404).json({ success: 0, message: `no post found or Not Authorized for post, id : ${id}` });
            res.status(200).json({ sucess: 1, message: `the post with id : ${id} updated.` });
        })();
    }

    destroy(req, res, next) {
        return _asyncToGenerator(function* () {
            const id = req.params.id;
            let post;

            if (req.user.role == 'Admin') {
                post = yield Post.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } });
            } else {
                post = yield Post.findOneAndUpdate({ _id: id, user: req.user._id, deletedAt: null }, { $set: { deletedAt: Date.now() } });
            }
            if (!post) return res.status(404).json({ success: 0, message: `No post found or Not Authorized for post, id : ${id}` });
            res.status(200).json({ sucess: 1, message: `the post with id : ${id} deleted.` });
        })();
    }

    createComment(req, res, next) {
        return _asyncToGenerator(function* () {
            const postId = req.params.id;
            const { body, name = null, email = null } = req.body;
            if (!req.user && !email | !name) return res.status(400).json({ success: 0, message: `who left this comment? email : ${email} - name: ${name}` });

            const newComment = new Comment({
                postId,
                body
            });
            if (req.user) {
                newComment.user = req.user._id;
            } else {
                newComment.guest.name = name;
                newComment.guest.email = email;
            }
            const post = yield Post.findOneAndUpdate({ _id: postId }, { $push: { comments: newComment._id } });
            if (!post) return res.status(404).json({
                success: 0, message: `no post found for given id : ${postId}`
            });
            const comment = yield newComment.save();
            if (req.user) {
                _mongoose2.default.model('User').findOneAndUpdate({ _id: req.user._id }, {
                    $inc: { commentCount: 1 }
                }).exec();
            }
            res.status(201).json({ success: 1, comment });
        })();
    }
    findComments(req, res, next) {
        return _asyncToGenerator(function* () {
            let id = req.params.id;
            const { skip = 0 } = req.query;
            let post = yield Post.findById(id).populate({
                path: 'comments', options: { limit: 10, skip: parseInt(skip) },
                populate: { path: 'user', select: 'name' }
            });

            console.log("post : ", post);
            if (!post) return res.status(404).json({ success: 0, message: `No post found with id/slug : ${id}` });
            res.status(200).json({ success: 1, comments: post.comments });
        })();
    }
    //api/posts/587accf87563311e706f32bc/comments
    findPostByUser(req, res, nex) {
        return _asyncToGenerator(function* () {
            console.log("this.s");
            let userId = req.params.userId;
            let user = yield User.findOne({ name: userId });
            if (!user) return res.status(404).send({ sucess: 0, message: `no user found!` });

            let query = req.query;
            let [posts, count, skip, limit, orderBy, orderDirection] = yield Post.FindAllAndCount({ query, home: true, userId: user._id });
            res.status(200).json({
                count, skip, limit, orderBy, orderDirection, posts
            });
        })();
    }

}
const ctrl = new PostCtrl();
ctrl.reservedKeys = ['comments', 'user', ...ctrl.defaultReservedKeys()];

router.route("/").get(ctrl.errorHandler(ctrl.index)).post(_passport2.default.authenticate('jwt', { session: false }), _authCheck.Auth.checkAuth(['Admin', 'Member']), ctrl.checkReq(), ctrl.errorHandler(ctrl.create)).all(ctrl.errorHandler(ctrl.notAllowed));

router.route("/:id").get(ctrl.checkId('mongo', 'slug'), ctrl.errorHandler(ctrl.find)).all(_passport2.default.authenticate('jwt', { session: false }), ctrl.checkId('mongo'), _authCheck.Auth.checkAuth(['Admin', 'Member'])).put(ctrl.checkReq(), ctrl.errorHandler(ctrl.update)).delete(ctrl.errorHandler(ctrl.destroy));

//.all(errorChecking(notAllowed));    
router.route('/:id/comments').all(ctrl.checkId('mongo'), ctrl.checkReq()).get(ctrl.errorHandler(ctrl.findComments)).post((req, res, next) => {
    if (req.get('Authorization')) {
        return _passport2.default.authenticate('jwt', { session: false })(req, res, next);
    }
    next();
}).post(ctrl.createComment);