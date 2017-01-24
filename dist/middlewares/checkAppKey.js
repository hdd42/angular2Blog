'use strict';

module.exports = (req, res, next) => {
    if (!req.headers['x-app-key'] || !req.headers['x-app-secret']) {
        let message = `no app key or app secret found!`;
        return res.status(401).json({ success: 0, message: `not authorized : ${ message }` });
    } else {
        next();
    }
};