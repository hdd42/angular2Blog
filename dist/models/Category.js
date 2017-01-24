'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _speakingurl = require('speakingurl');

var _speakingurl2 = _interopRequireDefault(_speakingurl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ObjectId = _mongoose2.default.Schema.Types.ObjectId;
const CategorySchema = new _mongoose2.default.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        minlength: 3, maxlength: 50
    },
    slug: {
        type: String, unique: true
    }
}, { timestamps: true });

CategorySchema.pre('save', function (next) {
    this.slug = (0, _speakingurl2.default)(this.title, { lang: 'tr' });
    next();
});

CategorySchema.statics.FindAllPostAndCountByCategory = function ({ id, query,
    select = ["_id", "createdAt", "title", "user", "comments", "slug", 'highlight'] }) {
    const { skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC", slug = '' } = query;
    let categoryQuery = slug ? { deletedAt: null, slug: id } : { deletedAt: null, _id: id };
    let sort = { [orderBy]: orderBy == 'ASC' ? '1' : '-1' };

    return new Promise((resolve, reject) => {
        this.findOne(categoryQuery).then(_cat => {
            if (!_cat) return reject(new Error(`no category found with , id or slug : ${id}`));
            return _cat._id;
        }).then(category => {
            return Promise.all([_mongoose2.default.model('Post').find({ deletedAt: null, category }).select(select.join(' ')).skip(parseInt(skip)).sort(sort).limit(parseInt(limit)), _mongoose2.default.model('Post').find({ deletedAt: null, category }).count()]);
        }).then(([posts, count]) => {
            resolve([posts, skip, limit, orderBy, orderDirection, count]);
        });
    });
};

module.exports = _mongoose2.default.model('Category', CategorySchema);