'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _speakingurl = require('speakingurl');

var _speakingurl2 = _interopRequireDefault(_speakingurl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ObjectId = _mongoose2.default.Schema.Types.ObjectId;

const PostSchema = new _mongoose2.default.Schema({
    title: {
        type: String,
        required: true,
        minlength: 10,
        unique: true
    },
    body: {
        type: String,
        required: true
    },
    highlight: { type: String },
    user: { type: ObjectId, ref: 'User', required: true },
    comments: [{ type: ObjectId, ref: 'Comment', required: true }],
    slug: { type: String, unique: true },
    deletedAt: { type: Date, default: null },
    category: { type: ObjectId, ref: 'Category' }
}, { timestamps: true });

PostSchema.statics.FindAllAndCount = function ({ query, select = ["_id", "createdAt", "title", "user", "comments", "slug", "category"],
    home = false, userId = null }) {
    const { skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC", slug = false, search = '' } = query;
    let sort = { [orderBy]: orderDirection == 'ASC' ? '-1' : '1' };

    if (home) {
        select.push('highlight');
    } else {
        select.push('body');
    }

    let finalQuery = { deletedAt: null };
    if (userId) {
        finalQuery.user = userId;
    }
    if (search) {
        finalQuery.$text = { $search: search };
    }
    console.log("search : ", finalQuery);
    return new Promise((resolve, reject) => {
        Promise.all([this.find(finalQuery).skip(parseInt(skip)).limit(parseInt(limit)).select(select.join(' ')).sort(sort).populate({
            path: 'user',
            select: 'name'
        }).populate({ path: 'category', select: 'title slug' }), this.find(finalQuery).count()]).then(([posts, count]) => resolve([posts, count, skip, limit, orderBy, orderDirection])).catch(err => reject(err));
    });
};

PostSchema.statics.FindByIdOrSlugWithComment = function (id, query, select = ["_id", "createdAt", "title", "user", "comments", "body", "slug", 'category']) {
    const { slug = false, skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC" } = query;
    const postQuery = slug ? { slug: id, deletedAt: null } : { _id: id, deletedAt: null };
    return new Promise((resolve, reject) => {
        this.findOne(postQuery).select(select.join(' ')).populate({ path: 'user', select: 'name' }).populate({
            path: 'comments', select: '-postId', options: { sort: 'createdAt', limit: 10 },
            populate: { path: 'user', select: 'name' }
        }).populate({ path: 'category', select: 'title' }).then(post => {
            if (post) {
                _mongoose2.default.model('Comment').find({ postId: post._id }).count().then(commentCount => {

                    resolve([post, commentCount, skip, limit, orderBy, orderDirection]);
                });
            } else {
                reject(new Error(`No post found with id/slug : ${id}`));
            }
        }).catch(err => reject(err));
    });
};

PostSchema.pre('save', function (next) {

    if (this.isModified('body') || this.isModified('title') || this.isNew) {
        this.highlight = homePosts(this.body);
        this.slug = (0, _speakingurl2.default)(this.title, { lang: 'tr' });
        return next();
    } else {
        return next();
    }
});

PostSchema.post('save', function (doc) {
    let userId = doc.user;
    _mongoose2.default.model('User').findOneAndUpdate({ _id: userId }, {
        $inc: { postCount: 1 }
    }).exec();
});

PostSchema.post('update', function (doc) {
    console.log("post deleted! : ", userId);
    if (doc.deletedAt) {
        let userId = doc.user;
        _mongoose2.default.model('User').findOneAndUpdate({ _id: userId }, {
            $inc: { postCount: -1 }
        }).exec();
        console.log("post deleted! : ", userId);
    }
});
//await User.findOneAndUpdate({_id:req.user._id},{$set:{ $inc: { postCount: -1} }})

function homePosts(body) {
    if (body.length > 400) return body.substring(0, 400);
    return body;
}

PostSchema.index({ title: 'text' });

module.exports = _mongoose2.default.model('Post', PostSchema);