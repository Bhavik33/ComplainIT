const SLA = require('../models/SLA');
const { DEFAULT_SLA } = require('../services/slaService');
const { sendSuccess, sendError } = require('../utils/response');
const { createAuditLog } = require('../services/auditService');

// @desc Get SLA configurations (Admin)
// @route GET /api/sla
const getSlaConfigs = async (req, res, next) => {
  try {
    let slas = await SLA.find();
    if (slas.length === 0) {
      // Seed default SLAs
      const defaults = [
        { priority: 'CRITICAL', resolutionHours: DEFAULT_SLA.CRITICAL },
        { priority: 'HIGH', resolutionHours: DEFAULT_SLA.HIGH },
        { priority: 'MEDIUM', resolutionHours: DEFAULT_SLA.MEDIUM },
        { priority: 'LOW', resolutionHours: DEFAULT_SLA.LOW }
      ];
      slas = await SLA.insertMany(defaults);
    }
    return sendSuccess(res, 200, 'SLA configurations fetched', slas);
  } catch (error) {
    next(error);
  }
};

// @desc Update SLA resolution hours for a priority (Admin)
// @route PUT /api/sla/:priority
const updateSlaConfig = async (req, res, next) => {
  try {
    const { priority } = req.params;
    const { resolutionHours } = req.body;

    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      return sendError(res, 400, 'Invalid priority level', 'VALIDATION_ERROR');
    }

    if (!resolutionHours || resolutionHours <= 0) {
      return sendError(res, 400, 'Resolution hours must be greater than 0', 'VALIDATION_ERROR');
    }

    let sla = await SLA.findOne({ priority });
    if (sla) {
      sla.resolutionHours = resolutionHours;
      sla.updatedBy = req.user._id;
      await sla.save();
    } else {
      sla = await SLA.create({
        priority,
        resolutionHours,
        updatedBy: req.user._id
      });
    }

    await createAuditLog(
      req.user._id,
      'SLA_UPDATED',
      'SLA',
      sla._id,
      { priority, resolutionHours },
      req.ip
    );

    return sendSuccess(res, 200, `SLA deadline for ${priority} updated to ${resolutionHours} hours`, sla);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSlaConfigs, updateSlaConfig };
