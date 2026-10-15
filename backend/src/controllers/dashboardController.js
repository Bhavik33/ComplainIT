const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Category = require('../models/Category');
const Rating = require('../models/Rating');
const { sendSuccess } = require('../utils/response');

// @desc Get dashboard metrics and charts data
// @route GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const isUser = req.user.role === 'USER';
    const isStaff = req.user.role === 'STAFF';
    const baseQuery = isUser ? { createdBy: req.user._id } : isStaff ? { assignedStaff: req.user._id } : {};

    const totalComplaints = await Complaint.countDocuments(baseQuery);
    const newComplaints = await Complaint.countDocuments({ ...baseQuery, status: 'NEW' });
    const inProgressComplaints = await Complaint.countDocuments({ ...baseQuery, status: 'IN_PROGRESS' });
    const resolvedComplaints = await Complaint.countDocuments({ ...baseQuery, status: 'RESOLVED' });
    const closedComplaints = await Complaint.countDocuments({ ...baseQuery, status: 'CLOSED' });
    const overdueComplaints = await Complaint.countDocuments({
      ...baseQuery,
      $or: [{ isBreached: true }, { status: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] }, slaDeadline: { $lt: new Date() } }]
    });

    // If User or Staff, return basic summary stats
    if (isUser || isStaff) {
      return sendSuccess(res, 200, 'User dashboard stats', {
        total: totalComplaints,
        new: newComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        closed: closedComplaints,
        overdue: overdueComplaints
      });
    }

    // ADMIN Analytics & Recharts Data
    // 1. Complaints by Category
    const categoryAgg = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoriesList = await Category.find().select('name');
    const categoryMap = {};
    categoriesList.forEach(c => { categoryMap[c._id.toString()] = c.name; });

    const complaintsByCategory = categoryAgg.map(item => ({
      name: categoryMap[item._id.toString()] || 'Other',
      value: item.count
    }));

    // 2. Complaints by Priority
    const priorityAgg = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const complaintsByPriority = priorityAgg.map(item => ({
      name: item._id,
      value: item.count
    }));

    // 3. Complaints by Status
    const statusAgg = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const complaintsByStatus = statusAgg.map(item => ({
      name: item._id,
      value: item.count
    }));

    // 4. Complaints over time (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const complaintsOverTimeAgg = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const complaintsOverTime = complaintsOverTimeAgg.map(item => ({
      date: item._id,
      count: item.count
    }));

    // 5. Staff Workload
    const staffMembers = await User.find({ role: 'STAFF', isActive: true }).select('name department');
    const staffWorkload = await Promise.all(
      staffMembers.map(async (staff) => {
        const assigned = await Complaint.countDocuments({ assignedStaff: staff._id, status: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] } });
        const resolved = await Complaint.countDocuments({ assignedStaff: staff._id, status: { $in: ['RESOLVED', 'CLOSED'] } });
        return {
          name: staff.name,
          department: staff.department,
          assigned,
          resolved
        };
      })
    );

    // 6. Average Resolution Time (in hours)
    const resolvedList = await Complaint.find({ status: { $in: ['RESOLVED', 'CLOSED'] }, resolutionDate: { $ne: null } });
    let avgResolutionHours = 0;
    if (resolvedList.length > 0) {
      const totalHours = resolvedList.reduce((acc, curr) => {
        const diffMs = new Date(curr.resolutionDate) - new Date(curr.createdAt);
        return acc + (diffMs / (1000 * 60 * 60));
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedList.length) * 10) / 10;
    }

    // 7. Satisfaction Score Analytics
    const allRatings = await Rating.find({}).select('score isResolutionSatisfactory reopenRequested');
    const avgSatisfactionScore = allRatings.length > 0
      ? Math.round((allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length) * 10) / 10
      : 0;
    const satisfiedCount = allRatings.filter(r => r.isResolutionSatisfactory !== false).length;
    const dissatisfiedCount = allRatings.filter(r => r.isResolutionSatisfactory === false).length;
    const satisfactionRate = allRatings.length > 0
      ? Math.round((satisfiedCount / allRatings.length) * 100)
      : 0;
    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: allRatings.filter(r => r.score === star).length
    }));

    // 8. Reopen Requests (pending review)
    const pendingReopenRequests = await Complaint.countDocuments({
      'reopenRequest.requested': true,
      'reopenRequest.reviewed': false
    });

    // 9. Duplicate / Master Incident stats
    const masterIncidentCount = await Complaint.countDocuments({ isMasterIncident: true });
    const linkedDuplicateCount = await Complaint.countDocuments({ masterComplaint: { $ne: null } });

    return sendSuccess(res, 200, 'Admin analytics dashboard stats', {
      total: totalComplaints,
      new: newComplaints,
      pending: newComplaints + inProgressComplaints,
      inProgress: inProgressComplaints,
      resolved: resolvedComplaints,
      closed: closedComplaints,
      overdue: overdueComplaints,
      avgResolutionHours,
      complaintsByCategory,
      complaintsByPriority,
      complaintsByStatus,
      complaintsOverTime,
      staffWorkload,
      // Satisfaction & Feedback
      avgSatisfactionScore,
      satisfactionRate,
      satisfiedCount,
      dissatisfiedCount,
      ratingDistribution,
      totalRatings: allRatings.length,
      // Reopen monitoring
      pendingReopenRequests,
      // Duplicates
      masterIncidentCount,
      linkedDuplicateCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
