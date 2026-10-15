const Complaint = require('../models/Complaint');
const { computeComplaintSimilarity, SIMILARITY_THRESHOLD } = require('../services/duplicateService');
const { sendSuccess, sendError } = require('../utils/response');
const { createAuditLog } = require('../services/auditService');

/**
 * @desc   Find complaints similar to a given one (duplicate detection)
 * @route  GET /api/complaints/:id/similar
 */
const getSimilarComplaints = async (req, res, next) => {
  try {
    const targetComplaint = await Complaint.findById(req.params.id)
      .populate('category', 'name');

    if (!targetComplaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    // Get all non-closed, non-rejected complaints in the same category
    const candidates = await Complaint.find({
      _id: { $ne: targetComplaint._id },
      category: targetComplaint.category._id || targetComplaint.category,
      status: { $nin: ['CLOSED', 'REJECTED'] },
      masterComplaint: null   // Don't include already-linked duplicates as candidates
    })
      .populate('category', 'name')
      .populate('createdBy', 'name')
      .lean();

    const similar = [];
    for (const candidate of candidates) {
      const score = computeComplaintSimilarity(targetComplaint, candidate);
      if (score >= SIMILARITY_THRESHOLD) {
        similar.push({
          ...candidate,
          similarityScore: score,
          similarityPercent: Math.round(score * 100)
        });
      }
    }

    // Sort by similarity score descending
    similar.sort((a, b) => b.similarityScore - a.similarityScore);

    return sendSuccess(res, 200, `Found ${similar.length} similar complaint(s)`, similar, {
      threshold: SIMILARITY_THRESHOLD,
      targetComplaintId: targetComplaint.complaintId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Link a complaint to a master incident complaint
 * @route  PUT /api/complaints/:id/link-master
 */
const linkToMaster = async (req, res, next) => {
  try {
    const { masterComplaintId, note } = req.body;

    if (!masterComplaintId) {
      return sendError(res, 400, 'masterComplaintId is required', 'VALIDATION_ERROR');
    }

    const [complaint, master] = await Promise.all([
      Complaint.findById(req.params.id),
      Complaint.findById(masterComplaintId)
    ]);

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }
    if (!master) {
      return sendError(res, 404, 'Master incident complaint not found', 'MASTER_NOT_FOUND');
    }
    if (req.params.id === masterComplaintId) {
      return sendError(res, 400, 'A complaint cannot be its own master', 'INVALID_LINK');
    }

    // Mark the complaint as linked to master
    complaint.masterComplaint = master._id;
    complaint.statusHistory.push({
      status: complaint.status,
      changedBy: req.user._id,
      note: note || `Linked to master incident: ${master.complaintId}`
    });
    await complaint.save();

    // Update master incident
    master.isMasterIncident = true;
    master.linkedCount = await Complaint.countDocuments({ masterComplaint: master._id });

    // Update master's similarComplaints list
    const alreadyLinked = master.similarComplaints.some(
      sc => sc.complaint.toString() === complaint._id.toString()
    );
    if (!alreadyLinked) {
      const score = computeComplaintSimilarity(master, complaint);
      master.similarComplaints.push({ complaint: complaint._id, similarityScore: score });
    }
    await master.save();

    await createAuditLog(
      req.user._id,
      'COMPLAINT_LINKED_DUPLICATE',
      'Complaint',
      complaint._id,
      { complaintId: complaint.complaintId, masterComplaintId: master.complaintId },
      req.ip
    );

    return sendSuccess(res, 200, `Complaint ${complaint.complaintId} linked to master incident ${master.complaintId}`, {
      linked: complaint,
      master: { _id: master._id, complaintId: master.complaintId, linkedCount: master.linkedCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Unlink a complaint from its master incident
 * @route  PUT /api/complaints/:id/unlink-master
 */
const unlinkFromMaster = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    if (!complaint.masterComplaint) {
      return sendError(res, 400, 'Complaint is not linked to any master incident', 'NOT_LINKED');
    }

    const masterId = complaint.masterComplaint;
    complaint.masterComplaint = null;
    await complaint.save();

    // Update master's linked count and similar list
    const master = await Complaint.findById(masterId);
    if (master) {
      master.linkedCount = await Complaint.countDocuments({ masterComplaint: master._id });
      master.similarComplaints = master.similarComplaints.filter(
        sc => sc.complaint.toString() !== complaint._id.toString()
      );
      if (master.linkedCount === 0) master.isMasterIncident = false;
      await master.save();
    }

    await createAuditLog(
      req.user._id,
      'COMPLAINT_UNLINKED_DUPLICATE',
      'Complaint',
      complaint._id,
      { complaintId: complaint.complaintId },
      req.ip
    );

    return sendSuccess(res, 200, 'Complaint unlinked from master incident successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all linked duplicates of a master complaint
 * @route  GET /api/complaints/:id/linked-duplicates
 */
const getLinkedDuplicates = async (req, res, next) => {
  try {
    const master = await Complaint.findById(req.params.id);
    if (!master) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    const duplicates = await Complaint.find({ masterComplaint: req.params.id })
      .populate('createdBy', 'name email department')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, `Master incident has ${duplicates.length} linked duplicate(s)`, duplicates);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Auto-scan a complaint and store its top similar matches
 * @route  POST /api/complaints/:id/scan-duplicates
 */
const scanAndStoreSimilar = async (req, res, next) => {
  try {
    const targetComplaint = await Complaint.findById(req.params.id)
      .populate('category', 'name');

    if (!targetComplaint) {
      return sendError(res, 404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    const candidates = await Complaint.find({
      _id: { $ne: targetComplaint._id },
      category: targetComplaint.category._id || targetComplaint.category,
      status: { $nin: ['CLOSED', 'REJECTED'] }
    }).populate('category', 'name').lean();

    const similar = [];
    for (const candidate of candidates) {
      const score = computeComplaintSimilarity(targetComplaint, candidate);
      if (score >= SIMILARITY_THRESHOLD) {
        similar.push({ complaint: candidate._id, similarityScore: score });
      }
    }

    targetComplaint.similarComplaints = similar.slice(0, 10); // keep top 10
    await targetComplaint.save();

    return sendSuccess(res, 200, `Scanned and stored ${similar.length} similar complaint match(es)`, {
      similarCount: similar.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSimilarComplaints, linkToMaster, unlinkFromMaster, getLinkedDuplicates, scanAndStoreSimilar };
