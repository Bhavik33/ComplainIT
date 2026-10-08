const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { createAuditLog } = require('../services/auditService');

// @desc Get all users (Admin)
// @route GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Users fetched', users);
  } catch (error) {
    next(error);
  }
};

// @desc Update user role / status (Admin)
// @route PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, department, name } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, 'User not found', 'NOT_FOUND');
    }

    if (role && ['USER', 'STAFF', 'ADMIN'].includes(role)) {
      user.role = role;
    }
    if (isActive !== undefined) user.isActive = isActive;
    if (department) user.department = department;
    if (name) user.name = name;

    await user.save();

    await createAuditLog(
      req.user._id,
      'USER_UPDATED',
      'User',
      user._id,
      { updatedRole: user.role, isActive: user.isActive },
      req.ip
    );

    return sendSuccess(res, 200, 'User updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete / Deactivate user (Admin)
// @route DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found', 'NOT_FOUND');
    }

    user.isActive = false;
    await user.save();

    await createAuditLog(req.user._id, 'USER_DELETED', 'User', user._id, { email: user.email }, req.ip);

    return sendSuccess(res, 200, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, updateUser, deleteUser };
