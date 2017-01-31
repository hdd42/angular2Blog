'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createSocket = undefined;

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let io = null;

const createSocket = exports.createSocket = server => {
    if (!io) {
        io = new _socket2.default(server);
        io.on('connection', socket => {
            console.log("new client connected!!! id : ", socket.id);
            socket.emit('accepted', { message: "hos geldin yeni istemci!" });
        });
    }
};