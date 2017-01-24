'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../lib/helpers');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class MainCtrl {

    //handle all error
    errorHandler(controller) {
        return (() => {
            var _ref = _asyncToGenerator(function* (req, res, next) {
                try {
                    yield controller(req, res, next);
                } catch (err) {
                    next(err);
                }
            });

            return function (_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            };
        })();
    }

    notAllowed(req, res) {
        res.status(405).json({ error: "Method not allowed" });
    }

    checkReq(requiredCheck = {}) {
        return (req, res, next) => {

            if (requiredCheck.check) {
                let message = this.checkRequired(req.body, requiredCheck.action);
                if (message.length > 0) return res.status(400).json({ success: 0, message });
            }
            let reservedKeys;
            if (this.reservedKeys) {
                reservedKeys = this.reservedKeys;
            } else {
                reservedKeys = this.defaultReservedKeys();
            }

            for (let reservedKey of reservedKeys) {
                if (req.body[reservedKey]) {
                    return res.status(400).json({
                        error: `Cannot specify '${ reservedKey }' as part of request body`
                    });
                }
            }
            next();
        };
    }
    checkId(type = 'mongo', slug = false) {
        return (req, res, next) => {
            const id = req.params.id;

            if (type == 'mongo' && !slug) {
                if ((0, _helpers.checkMongoId)(id)) {
                    return next();
                } else {
                    return res.status(400).json({
                        error: `This is not a valid id format, provided id : ${ id }`
                    });
                }
            }
            if (type == 'mongo' && slug) {
                console.log('slug: ', slug);
                if ((0, _helpers.checkMongoId)(id)) {
                    return next();
                } else {
                    if (!req.query.slug) return res.status(400).json({
                        error: `This is not a valid id or slug format, provided id : ${ id }, slug : ${ slug }`
                    });
                    return next();
                }
            }

            return next();
        };
    }

    checkRequired(body, action) {

        let missing = [];
        console.log('Body : ', body);
        for (let field of this[action].required) {
            if (!body[field]) {
                missing.push(`the field '${ field }' is required`);
            }
        }
        return missing;
    }

    defaultReservedKeys() {
        return ["_id", "id", "createdAt", "updatedAt", 'deletedAt'];
    }

}
exports.default = MainCtrl;