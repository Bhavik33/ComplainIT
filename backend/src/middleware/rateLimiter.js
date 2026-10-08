const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limit for auth endpoints
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

module.exports = { apiLimiter, authLimiter };
