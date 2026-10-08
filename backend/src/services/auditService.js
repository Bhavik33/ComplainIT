const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

const createAuditLog = async (userId, action, entity, entityId = '', details = {}, ipAddress = '127.0.0.1') => {
  try {
    await AuditLog.create({
      user: userId || null,
      action,
      entity,
      entityId: String(entityId),
      details,
      ipAddress
    });
  } catch (error) {
    logger.error(`Audit log creation failed: ${error.message}`);
  }
};

module.exports = { createAuditLog };
