const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
exports.createAccessToken = (user) => jwt.sign({role:user.role}, jwtSecret, {subject:user._id.toString(), expiresIn:jwtExpiresIn});
