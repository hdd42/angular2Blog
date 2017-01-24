'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('../config/config');

var _config2 = _interopRequireDefault(_config);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Db {
    constructor() {
        _mongoose2.default.Promise = _bluebird2.default.Promise;
    }

    connect() {
        return new Promise((resolve, reject) => {
            _mongoose2.default.connect(_config2.default.db).then(() => {
                this.db = _mongoose2.default.connection;
                resolve(true);
            }).catch(err => {
                reject(err);
            });
        });
    }

    connection() {
        return this.db;
    }
}
exports.default = Db;