/**
 * Human-Readable Complaint ID Generator
 * Format: CMP-YYYY-XXXX (e.g. CMP-2026-0001)
 */

const Complaint = require('../models/Complaint');

const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CMP-${currentYear}-`;

  // Find the latest complaint created in current year
  const latestComplaint = await Complaint.findOne({
    complaintId: { $regex: new RegExp(`^${prefix}`) }
  }).sort({ createdAt: -1 });

  let nextSequence = 1;
  if (latestComplaint && latestComplaint.complaintId) {
    const parts = latestComplaint.complaintId.split('-');
    if (parts.length === 3) {
      const currentSeq = parseInt(parts[2], 10);
      if (!isNaN(currentSeq)) {
        nextSequence = currentSeq + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSequence}`;
};

module.exports = { generateComplaintId };
