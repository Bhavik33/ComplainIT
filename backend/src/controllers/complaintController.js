const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Attachment = require('../models/Attachment');
const Rating = require('../models/Rating');
const { generateComplaintId } = require('../utils/generateId');
const { calculateSlaDeadline } = require('../services/slaService');
const { createAuditLog } = require('../services/auditService');
const { sendNotification } = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/response');
const { complaintsCreatedTotal, complaintsResolvedTotal } = require('../config/metrics');

// Valid status transitions map
const VALID_TRANSITIONS = {
  NEW: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'ON_HOLD', 'REJECTED'],
  ON_HOLD: ['IN_PROGRESS', 'RESOLVED', 'REJECTED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['IN_PROGRESS', 'RESOLVED'],
  CLOSED: [],
  REJECTED: []
};

// @desc Create a new complaint
// @route POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, categoryId, subcategory, priority } = req.body;

    if (!title || !description || !categoryId) {
      return sendError(res, 400, 'Title, description, and category are required', 'VALIDATION_ERROR');
    }

    const categoryObj = await Category.findById(categoryId);
    if (!categoryObj) {
      return sendError(res, 404, 'Selected category does not exist', 'CATEGORY_NOT_FOUND');
    }

    const complaintPriority = priority && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)
      ? priority
      : 'MEDIUM';

    const complaintId = await generateComplaintId();
    const slaDeadline = await calculateSlaDeadline(complaintPriority);

    const attachmentsList = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const att = await Attachment.create({
          uploadedBy: req.user._id,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`
        });
        attachmentsList.push(att._id);
      }
    }

    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category: categoryId,
      subcategory: subcategory || 'General',
      priority: complaintPriority,
      status: 'NEW',
      createdBy: req.user._id,
      slaDeadline,
      attachments: attachmentsList,
      statusHistory: [
        {
          status: 'NEW',
          changedBy: req.user._id,
          note: 'Complaint created by user'
        }
      ]
    });

    // Increment metric
    complaintsCreatedTotal.inc({ category: categoryObj.name, priority: complaintPriority });

    await createAuditLog(req.user._id, 'COMPLAINT_CREATED', 'Complaint', complaint._id, { complaintId, title }, req.ip);

    await sendNotification(
      req.user._id,
      'Complaint Submitted',
      `Your complaint ${complaintId} has been successfully submitted and logged in the portal.`,
      complaint._id
    );

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('category', 'name icon')
      .populate('createdBy', 'name email department')
      .populate('attachments');

    return sendSuccess(res, 201, 'Complaint submitted successfully', populatedComplaint);
  } catch (error) {
    next(error);
  }
};

// @desc Get complaints list with search, filters, pagination
// @route GET /api/complaints
const getComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, category, status, priority, assignedStaff, dateFrom, dateTo, sort } = req.query;

    const query = {};

    // Role-based visibility scoping
    if (req.user.role === 'USER') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'STAFF') {
      // Staff views assigned complaints or unassigned NEW complaints
      query.$or = [{ assignedStaff: req.user._id }, { status: 'NEW' }];
    }

    // Search filter
    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedStaff) query.assignedStaff = assignedStaff;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('category', 'name icon')
      .populate('createdBy', 'name email department')
      .populate('assignedStaff', 'name email department')
      .populate('rating')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, 'Complaints retrieved successfully', complaints, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get complaint by ID
// @route GET /api/complaints/:id
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('category', 'name icon description')
      .populate('createdBy', 'name email department phone')
      .populate('assignedStaff', 'name email department phone')
      .populate('attachments')
      .populate('statusHistory.changedBy', 'name role')
      .populate('internalNotes.addedBy', 'name role')
      .populate('rating');

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    // Role safety check
    if (req.user.role === 'USER' && complaint.createdBy._id.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied to this complaint', 'FORBIDDEN');
    }

    return sendSuccess(res, 200, 'Complaint details fetched', complaint);
  } catch (error) {
    next(error);
  }
};

// @desc Update complaint status
// @route PUT /api/complaints/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('category', 'name');

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    const currentStatus = complaint.status;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    // Allow reopen for USER if current is RESOLVED
    if (status === 'REOPENED') {
      if (req.user.role !== 'USER' && req.user.role !== 'ADMIN') {
        return sendError(res, 403, 'Only complaint owners or admins can reopen resolved complaints', 'FORBIDDEN');
      }
      if (currentStatus !== 'RESOLVED') {
        return sendError(res, 400, 'Only RESOLVED complaints can be reopened', 'INVALID_TRANSITION');
      }
    } else {
      // Role enforcement
      if (req.user.role === 'USER') {
        if (status !== 'CLOSED') {
          return sendError(res, 403, 'Users can only close or reopen resolved complaints', 'FORBIDDEN');
        }
      }

      if (!allowedNext.includes(status)) {
        return sendError(
          res,
          400,
          `Cannot transition complaint status from ${currentStatus} to ${status}`,
          'INVALID_TRANSITION'
        );
      }
    }

    complaint.status = status;
    if (status === 'RESOLVED') {
      complaint.resolutionDate = new Date();
      if (complaint.category && complaint.category.name) {
        complaintsResolvedTotal.inc({ category: complaint.category.name });
      }
    }

    complaint.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status updated to ${status}`
    });

    await complaint.save();

    await createAuditLog(
      req.user._id,
      'STATUS_CHANGED',
      'Complaint',
      complaint._id,
      { complaintId: complaint.complaintId, oldStatus: currentStatus, newStatus: status },
      req.ip
    );

    // Notify User
    await sendNotification(
      complaint.createdBy,
      `Status Update: ${complaint.complaintId}`,
      `Your complaint ${complaint.complaintId} status changed from ${currentStatus} to ${status}.`,
      complaint._id
    );

    return sendSuccess(res, 200, `Complaint status changed to ${status}`, complaint);
  } catch (error) {
    next(error);
  }
};

// @desc Assign complaint to staff
// @route PUT /api/complaints/:id/assign
const assignStaff = async (req, res, next) => {
  try {
    const { staffId, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    complaint.assignedStaff = staffId;
    if (complaint.status === 'NEW') {
      complaint.status = 'ASSIGNED';
      complaint.statusHistory.push({
        status: 'ASSIGNED',
        changedBy: req.user._id,
        note: note || 'Assigned to support staff'
      });
    }

    await complaint.save();

    await createAuditLog(
      req.user._id,
      'COMPLAINT_ASSIGNED',
      'Complaint',
      complaint._id,
      { complaintId: complaint.complaintId, assignedStaff: staffId },
      req.ip
    );

    // Notify Staff
    await sendNotification(
      staffId,
      'New Complaint Assigned',
      `You have been assigned complaint ${complaint.complaintId}.`,
      complaint._id
    );

    // Notify User
    await sendNotification(
      complaint.createdBy,
      'Staff Assigned',
      `Staff member assigned to your complaint ${complaint.complaintId}.`,
      complaint._id
    );

    const updated = await Complaint.findById(complaint._id)
      .populate('assignedStaff', 'name email department');

    return sendSuccess(res, 200, 'Complaint assigned successfully', updated);
  } catch (error) {
    next(error);
  }
};

// @desc Update priority (Admin only)
// @route PUT /api/complaints/:id/priority
const updatePriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      return sendError(res, 400, 'Invalid priority level', 'VALIDATION_ERROR');
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    complaint.priority = priority;
    complaint.slaDeadline = await calculateSlaDeadline(priority);
    await complaint.save();

    await createAuditLog(
      req.user._id,
      'PRIORITY_CHANGED',
      'Complaint',
      complaint._id,
      { complaintId: complaint.complaintId, newPriority: priority },
      req.ip
    );

    return sendSuccess(res, 200, `Complaint priority updated to ${priority}`, complaint);
  } catch (error) {
    next(error);
  }
};

// @desc Add internal note (Staff / Admin)
// @route POST /api/complaints/:id/internal-notes
const addInternalNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note) {
      return sendError(res, 400, 'Note text is required', 'VALIDATION_ERROR');
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    complaint.internalNotes.push({
      note,
      addedBy: req.user._id
    });

    await complaint.save();

    return sendSuccess(res, 200, 'Internal note added successfully', complaint.internalNotes);
  } catch (error) {
    next(error);
  }
};

// @desc Rate resolved complaint (User)
// @route POST /api/complaints/:id/rate
const rateComplaint = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    if (!score || score < 1 || score > 5) {
      return sendError(res, 400, 'Rating score must be between 1 and 5', 'VALIDATION_ERROR');
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the complaint creator can submit a rating', 'FORBIDDEN');
    }

    if (!['RESOLVED', 'CLOSED'].includes(complaint.status)) {
      return sendError(res, 400, 'Complaints must be RESOLVED or CLOSED before rating', 'INVALID_STATE');
    }

    let ratingObj = await Rating.findOne({ complaint: complaint._id });
    if (ratingObj) {
      ratingObj.score = score;
      ratingObj.feedback = feedback || '';
      await ratingObj.save();
    } else {
      ratingObj = await Rating.create({
        complaint: complaint._id,
        user: req.user._id,
        score,
        feedback: feedback || ''
      });
      complaint.rating = ratingObj._id;
      await complaint.save();
    }

    await createAuditLog(
      req.user._id,
      'COMPLAINT_RATED',
      'Complaint',
      complaint._id,
      { score, feedback },
      req.ip
    );

    return sendSuccess(res, 200, 'Thank you for your rating!', ratingObj);
  } catch (error) {
    next(error);
  }
};

// @desc Export complaints as CSV (Admin)
// @route GET /api/complaints/export/csv
const exportCsv = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedStaff', 'name email');

    let csv = 'Complaint ID,Title,Category,Priority,Status,Created By,Assigned Staff,SLA Deadline,Is Breached,Created Date\n';

    complaints.forEach(c => {
      const categoryName = c.category ? c.category.name : 'N/A';
      const creator = c.createdBy ? c.createdBy.name : 'N/A';
      const staff = c.assignedStaff ? c.assignedStaff.name : 'Unassigned';
      csv += `"${c.complaintId}","${c.title.replace(/"/g, '""')}","${categoryName}","${c.priority}","${c.status}","${creator}","${staff}","${c.slaDeadline.toISOString()}","${c.isBreached}","${c.createdAt.toISOString()}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('resolveit-complaints-report.csv');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignStaff,
  updatePriority,
  addInternalNote,
  rateComplaint,
  exportCsv
};
