const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const { sendNotification } = require('../services/notificationService');
const { slaBreachesTotal } = require('../config/metrics');
const logger = require('../config/logger');

const checkOverdueComplaints = async () => {
  try {
    const now = new Date();
    const overdueComplaints = await Complaint.find({
      status: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] },
      slaDeadline: { $lt: now },
      isBreached: false
    });

    if (overdueComplaints.length === 0) return;

    logger.info(`SLA Checker: Found ${overdueComplaints.length} newly breached complaints`);

    for (const complaint of overdueComplaints) {
      complaint.isBreached = true;
      await complaint.save();

      // Increment metric
      slaBreachesTotal.inc();

      // Notify User
      await sendNotification(
        complaint.createdBy,
        'SLA Deadline Overdue',
        `Your complaint ${complaint.complaintId} has passed its estimated resolution SLA deadline. Support escalation in progress.`,
        complaint._id
      );

      // Notify Assigned Staff
      if (complaint.assignedStaff) {
        await sendNotification(
          complaint.assignedStaff,
          'SLA Breached Alert',
          `Complaint ${complaint.complaintId} assigned to you has breached its resolution SLA deadline!`,
          complaint._id
        );
      }
    }
  } catch (error) {
    logger.error(`Error in SLA Checker Job: ${error.message}`);
  }
};

const initSlaJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    logger.info('Running background SLA Checker Cron Job');
    checkOverdueComplaints();
  });
};

module.exports = { initSlaJob, checkOverdueComplaints };
