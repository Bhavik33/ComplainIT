const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');
const { sendSuccess, sendError } = require('../utils/response');
const { createAuditLog } = require('../services/auditService');
const { sendNotification } = require('../services/notificationService');

// @desc Add comment to complaint
// @route POST /api/complaints/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { text, isInternal } = req.body;
    if (!text) {
      return sendError(res, 400, 'Comment text is required', 'VALIDATION_ERROR');
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    // Role check: Users cannot post internal comments
    const internalFlag = (req.user.role === 'STAFF' || req.user.role === 'ADMIN') ? Boolean(isInternal) : false;

    const comment = await Comment.create({
      complaint: complaint._id,
      user: req.user._id,
      text,
      isInternal: internalFlag
    });

    await createAuditLog(
      req.user._id,
      'COMMENT_ADDED',
      'Complaint',
      complaint._id,
      { isInternal: internalFlag },
      req.ip
    );

    // Notify the other party
    if (!internalFlag) {
      if (req.user.role === 'USER' && complaint.assignedStaff) {
        await sendNotification(
          complaint.assignedStaff,
          'New Comment from User',
          `User added a comment on complaint ${complaint.complaintId}: "${text.substring(0, 40)}..."`,
          complaint._id
        );
      } else if (req.user._id.toString() !== complaint.createdBy.toString()) {
        await sendNotification(
          complaint.createdBy,
          'New Response on Complaint',
          `New response added on complaint ${complaint.complaintId}: "${text.substring(0, 40)}..."`,
          complaint._id
        );
      }
    }

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name role email');

    return sendSuccess(res, 201, 'Comment added successfully', populatedComment);
  } catch (error) {
    next(error);
  }
};

// @desc Get comments for complaint
// @route GET /api/complaints/:id/comments
const getComments = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    const query = { complaint: req.params.id };

    // Users should not see internal comments
    if (req.user.role === 'USER') {
      query.isInternal = false;
    }

    const comments = await Comment.find(query)
      .populate('user', 'name role email')
      .sort({ createdAt: 1 });

    return sendSuccess(res, 200, 'Comments fetched', comments);
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments };
