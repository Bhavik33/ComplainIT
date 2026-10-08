const winston = require('winston');
const path = require('path');

// Mask sensitive info like password and token
const redactSensitive = winston.format((info) => {
  if (info.meta && typeof info.meta === 'object') {
    if (info.meta.password) info.meta.password = '[REDACTED]';
    if (info.meta.token) info.meta.token = '[REDACTED]';
    if (info.meta.jwt) info.meta.jwt = '[REDACTED]';
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactSensitive(),
    winston.format.json()
  ),
  defaultMeta: { service: 'resolveit-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `[${timestamp}] [${level}] [${service}]: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

module.exports = logger;
