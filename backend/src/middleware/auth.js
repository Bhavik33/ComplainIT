const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, token missing', 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'resolveit_super_secret_jwt_key_2026_change_in_production');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User account no longer exists', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account is deactivated. Contact administrator.', 'ACCOUNT_DISABLED');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token', 'TOKEN_INVALID');
  }
};

module.exports = { protect };
