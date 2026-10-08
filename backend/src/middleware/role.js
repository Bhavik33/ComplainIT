const { sendError } = require('../utils/response');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'User context missing', 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Role '${req.user.role}' is not authorized to perform this operation`,
        'FORBIDDEN'
      );
    }
    next();
  };
};

module.exports = { authorize };
