import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import Module from '../models/Module.js';

/**
 * controllers/moduleController.js
 *
 * getAllModules  → Lists all published modules (student curriculum view)
 * getModuleById → Single module with populated topics
 * createModule  → Admin only — creates a new module
 * updateModule  → Admin only — updates module fields
 * deleteModule  → Admin only — deletes module
 */

// @desc   Get all published modules (ordered by `order` field)
// @route  GET /api/modules
// @access Public
export const getAllModules = asyncHandler(async (req, res) => {
  const modules = await Module.find({ isPublished: true })
    .populate('topics', 'title slug difficulty xpReward estimatedMinutes order isPublished')
    .sort('order');

  return successResponse(res, 200, 'Modules retrieved.', { count: modules.length, modules });
});

// @desc   Get a single module by ID with all topics
// @route  GET /api/modules/:id
// @access Public
export const getModuleById = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.id)
    .populate('topics', 'title slug difficulty xpReward estimatedMinutes order');

  if (!module) return errorResponse(res, 404, 'Module not found.');
  return successResponse(res, 200, 'Module retrieved.', { module });
});

// @desc   Create a new module
// @route  POST /api/modules
// @access Private/Admin
export const createModule = asyncHandler(async (req, res) => {
  const module = await Module.create(req.body);
  return successResponse(res, 201, 'Module created.', { module });
});

// @desc   Update a module
// @route  PUT /api/modules/:id
// @access Private/Admin
export const updateModule = asyncHandler(async (req, res) => {
  const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!module) return errorResponse(res, 404, 'Module not found.');
  return successResponse(res, 200, 'Module updated.', { module });
});

// @desc   Delete a module
// @route  DELETE /api/modules/:id
// @access Private/Admin
export const deleteModule = asyncHandler(async (req, res) => {
  const module = await Module.findByIdAndDelete(req.params.id);
  if (!module) return errorResponse(res, 404, 'Module not found.');
  return successResponse(res, 200, 'Module deleted.');
});
