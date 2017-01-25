'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _config = require('../config/config');

var _config2 = _interopRequireDefault(_config);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express2.default.Router();

//  mongoose = require('mongoose'),
//  Article = mongoose.model('Article');

module.exports = app => {
  app.use('/', router);
};

router.all('/', (req, res, next) => {
        res.status(200).sendFile('index.html', { root: config.root});
});
router.all('/api', function (req, res, next) {
  let message = "Welcome to blog api";
  let success = "1";
  res.status(200).send({ success, message });
});
