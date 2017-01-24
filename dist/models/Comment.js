'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ObjectId = _mongoose2.default.Schema.Types.ObjectId;
const CommentSchema = new _mongoose2.default.Schema({
    body: {
        type: String,
        required: true
    },
    user: { type: ObjectId, ref: 'User' },
    guest: {
        name: String,
        email: String
    },
    postId: { type: String, required: true }

}, { timestamps: true });

CommentSchema.statics.FindAllAndCount = function ({ query, select = ["_id", "createdAt", "body", 'user', 'guest'] }) {
    const { skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC" } = query;

    return new Promise((resolve, reject) => {
        Promise.all([this.find({ deletedAt: null }).skip(parseInt(skip)).limit(parseInt(limit)).select(select.join(' ')).populate({ path: 'user', select: 'name' }), this.count()]).then(([comments, count]) => resolve([comments, count, skip, limit, orderBy, orderDirection])).catch(err => reject(err));
    });
};

module.exports = _mongoose2.default.model('Comment', CommentSchema);