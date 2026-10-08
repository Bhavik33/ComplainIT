const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/response');
const { createAuditLog } = require('../services/auditService');

// @desc Get all categories
// @route GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, 200, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

// @desc Create category (Admin)
// @route POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return sendError(res, 400, 'Category name is required', 'VALIDATION_ERROR');
    }

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) {
      return sendError(res, 400, 'Category with this name already exists', 'DUPLICATE_CATEGORY');
    }

    const category = await Category.create({
      name,
      description: description || '',
      icon: icon || 'Wrench'
    });

    await createAuditLog(req.user._id, 'CATEGORY_CREATED', 'Category', category._id, { name }, req.ip);

    return sendSuccess(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc Update category (Admin)
// @route PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Category not found', 'NOT_FOUND');
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    await createAuditLog(req.user._id, 'CATEGORY_UPDATED', 'Category', category._id, { name: category.name }, req.ip);

    return sendSuccess(res, 200, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc Delete category (Admin)
// @route DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found', 'NOT_FOUND');
    }

    category.isActive = false;
    await category.save();

    await createAuditLog(req.user._id, 'CATEGORY_DELETED', 'Category', category._id, { name: category.name }, req.ip);

    return sendSuccess(res, 200, 'Category deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
