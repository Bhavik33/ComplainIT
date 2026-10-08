const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/response');
const { createAuditLog } = require('../services/auditService');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'resolveit_super_secret_jwt_key_2026_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// @desc Register user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, department, phone, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required', 'VALIDATION_ERROR');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'User with this email already exists', 'USER_EXISTS');
    }

    // Role safety: public registration can only be USER or STAFF if specified, default USER
    const userRole = role === 'STAFF' ? 'STAFF' : 'USER';

    const user = await User.create({
      name,
      email,
      password,
      department: department || 'General',
      phone: phone || '',
      role: userRole
    });

    await createAuditLog(user._id, 'USER_REGISTERED', 'User', user._id, { email: user.email, role: user.role }, req.ip);

    const token = generateToken(user._id);

    return sendSuccess(res, 201, 'User registered successfully', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password', 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account is disabled. Contact system admin.', 'ACCOUNT_DISABLED');
    }

    await createAuditLog(user._id, 'USER_LOGGED_IN', 'User', user._id, { email: user.email }, req.ip);

    const token = generateToken(user._id);

    return sendSuccess(res, 200, 'Logged in successfully', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Logout user
// @route POST /api/auth/logout
const logout = async (req, res) => {
  if (req.user) {
    await createAuditLog(req.user._id, 'USER_LOGGED_OUT', 'User', req.user._id, {}, req.ip);
  }
  return sendSuccess(res, 200, 'Logged out successfully');
};

// @desc Get current profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Profile fetched', {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      phone: req.user.phone
    }
  });
};

// @desc Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, department, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (department) user.department = department;
    if (phone) user.phone = phone;

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, updateProfile };
