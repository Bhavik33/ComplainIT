const AuditLog = require('../models/AuditLog');
const { sendSuccess } = require('../utils/response');

// @desc Get audit logs (Admin only)
// @route GET /api/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { action, entity, search } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { entity: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, 'Audit logs retrieved', logs, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
