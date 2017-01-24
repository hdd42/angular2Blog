'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express2.default.Router();
//  mongoose = require('mongoose'),
//  Article = mongoose.model('Article');

module.exports = app => {
  app.use('/', router);
};

router.all('/', function (req, res, next) {
  let message = "Welcome to blog api";
  let success = "1";
  res.status(200).send({ success, message });
});