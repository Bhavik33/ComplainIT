const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');

// @desc Get user notifications
// @route GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('complaint', 'complaintId title status')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    return sendSuccess(res, 200, 'Notifications retrieved', notifications, { unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return sendError(res, 404, 'Notification not found', 'NOT_FOUND');
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 200, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

// @desc Mark all notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
