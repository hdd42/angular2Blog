'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _speakingurl = require('speakingurl');

var _speakingurl2 = _interopRequireDefault(_speakingurl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ObjectId = _mongoose2.default.Schema.Types.ObjectId;
const ContactSchema = new _mongoose2.default.Schema({
    subject: {
        type: String,
        required: [true, "Konu alani zorunludur!"]
    },
    email: { type: String, required: [true, "email alani zorunludur!"] },
    message: { type: String, required: [true, "mesaj alani zorunludur!"] },
    name: { type: String, required: [true, "name alani zorunludur!"] }
}, { timestamps: true });

module.exports = _mongoose2.default.model('Contact', ContactSchema);