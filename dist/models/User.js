'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _argon = require('argon2');

var _argon2 = _interopRequireDefault(_argon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const UserSchema = new _mongoose2.default.Schema({
    email: {
        type: String,
        lowercase: true,
        validate: {
            validator: function (e) {
                const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return reg.test(e);
            },
            message: '{VALUE} is not a valid email!'
        },
        unique: true,
        required: [true, "email alani zorunludur!"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['Guest', 'Member', 'Admin'],
        default: 'Member'
    },
    active: { type: Boolean, default: true },
    name: { type: String, required: true, minlength: 3, maxlength: 10 },
    postCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

UserSchema.pre('save', (() => {
    var _ref = _asyncToGenerator(function* (next) {

        let hash = '';

        if (this.isModified('password') || this.isNew) {
            try {
                hash = yield _argon2.default.hash(this.password, (yield _argon2.default.generateSalt()));
                this.password = hash;
                next();
            } catch (error) {
                next(error);
            }
        }
    });

    return function (_x) {
        return _ref.apply(this, arguments);
    };
})());

// compare password input to password saved in database
UserSchema.methods.comparePassword = function (pw) {
    return new Promise((resolve, reject) => {
        _argon2.default.verify(this.password, pw).then(match => {
            resolve(match);
        }).catch(err => {
            reject(err);
        });
    });
};
UserSchema.statics.FindAllAndCount = function (query) {
    const { skip = 0, limit = 10, orderBy = "createdAt", orderDirection = "ASC", search = '' } = query;
    let sort = { [orderBy]: orderDirection == 'ASC' ? '-1' : '1' };
    console.log("Order by : ", orderBy);

    let finalQuery = { deletedAt: null };
    if (search) {
        finalQuery.$text = { $search: search };
    }
    return new Promise((resolve, reject) => {
        Promise.all([this.find(finalQuery).skip(parseInt(skip)).limit(parseInt(limit)).sort(sort), this.count(finalQuery)]).then(([users, count]) => {

            resolve([users, count, skip, limit, orderBy, orderDirection]);
        }).catch(err => reject(err));
    });
};
UserSchema.index({ name: 'text' });

module.exports = _mongoose2.default.model('User', UserSchema);