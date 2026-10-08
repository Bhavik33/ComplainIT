const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('./emailService');
const logger = require('../config/logger');

const sendNotification = async (userId, title, message, complaintId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      complaint: complaintId
    });

    const user = await User.findById(userId);
    if (user && user.email) {
      await sendEmail(
        user.email,
        `[ResolveIT] Notification: ${title}`,
        `${message}\n\nLog into ResolveIT portal to view details.`
      );
    }

    return notification;
  } catch (error) {
    logger.error(`Notification creation error: ${error.message}`);
  }
};

module.exports = { sendNotification };
