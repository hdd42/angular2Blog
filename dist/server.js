"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

let startServer = (() => {
    var _ref = _asyncToGenerator(function* () {
        const db = new _db2.default();
        try {
            yield db.connect();
            console.log("Connected to DB!");
            yield app.listen(_config2.default.port);
            console.log(`Server listening on port : ${_config2.default.port}`);
        } catch (err) {
            console.log("Connection Failed to DB! : ", err);
            process.exit(1);
        }
    });

    return function startServer() {
        return _ref.apply(this, arguments);
    };
})();

//E-mail: roomrentnyc1@gmail.com


var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _config = require("./config/config");

var _config2 = _interopRequireDefault(_config);

var _db = require("./lib/db");

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const models = _glob2.default.sync(_config2.default.root + '/models/*.js');

models.forEach(function (model) {
    require(model);
});

const app = (0, _express2.default)();

//export Routed App;
exports.default = require('./config/express')(app, _config2.default);


startServer();