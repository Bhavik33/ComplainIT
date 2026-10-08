const SLA = require('../models/SLA');

const DEFAULT_SLA = {
  CRITICAL: 8,
  HIGH: 24,
  MEDIUM: 48,
  LOW: 72
};

const calculateSlaDeadline = async (priority) => {
  let hours = DEFAULT_SLA[priority] || 48;

  try {
    const slaConfig = await SLA.findOne({ priority });
    if (slaConfig && slaConfig.resolutionHours) {
      hours = slaConfig.resolutionHours;
    }
  } catch (error) {
    // Fallback to default
  }

  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};

module.exports = { calculateSlaDeadline, DEFAULT_SLA };
