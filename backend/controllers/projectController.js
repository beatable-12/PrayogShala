import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import PROJECT_BANK, { getProjectByTopicSlug } from '../data/projectBank.js';
import User from '../models/User.js';

// @desc   Get project by topic slug (from bank)
// @route  GET /api/projects/topic/:topicSlug
// @access Private
export const getProjectByTopic = asyncHandler(async (req, res) => {
  const { topicSlug } = req.params;
  const project = getProjectByTopicSlug(topicSlug);
  if (!project) return errorResponse(res, 404, 'No project found for this topic.');
  return successResponse(res, 200, 'Project retrieved.', {
    ...project,
    unlocked: false,
    milestones: project.milestones.map(m => ({ ...m, completed: false })),
  });
});

// @desc   Get project by bank index
// @route  GET /api/projects/bank/:index
// @access Private
export const getProjectByIndex = asyncHandler(async (req, res) => {
  const index = parseInt(req.params.index, 10);
  const project = PROJECT_BANK[index];
  if (!project) return errorResponse(res, 404, 'Project not found.');
  return successResponse(res, 200, 'Project retrieved.', {
    ...project,
    bankIndex: index,
  });
});

// @desc   Get all projects from the bank
// @route  GET /api/projects/bank
// @access Private
export const getAllBankProjects = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Project bank retrieved.', {
    count: PROJECT_BANK.length,
    projects: PROJECT_BANK.map((p, i) => ({
      bankIndex: i,
      title: p.title,
      topicTitle: p.topicTitle,
      moduleTitle: p.moduleTitle,
      difficulty: p.difficulty,
      estimatedHours: p.estimatedHours,
      milestoneCount: p.milestones.length,
    })),
  });
});

// @desc   Unlock project after completing questions
// @route  POST /api/projects/unlock
// @access Private
export const unlockProject = asyncHandler(async (req, res) => {
  const { topicId } = req.body;
  if (!topicId) return errorResponse(res, 400, 'topicId is required.');

  const user = await User.findById(req.user._id);
  if (!user) return errorResponse(res, 404, 'User not found.');

  // Check if user has completed this topic's questions
  if (!user.completedTopics?.includes(topicId)) {
    return errorResponse(res, 403, 'Complete both questions first to unlock this project.');
  }

  // Prevent duplicate unlock
  if (user.unlockedProjects?.includes(topicId)) {
    return successResponse(res, 200, 'Project already unlocked.', { unlocked: true });
  }

  user.unlockedProjects = user.unlockedProjects || [];
  user.unlockedProjects.push(topicId);
  await user.save();

  return successResponse(res, 200, 'Project unlocked successfully!', { unlocked: true });
});

// @desc   Complete a milestone
// @route  PUT /api/projects/milestone
// @access Private
export const completeMilestone = asyncHandler(async (req, res) => {
  const { topicId, milestoneIndex } = req.body;
  if (!topicId || milestoneIndex === undefined) return errorResponse(res, 400, 'topicId and milestoneIndex are required.');

  const user = await User.findById(req.user._id);
  if (!user) return errorResponse(res, 404, 'User not found.');

  const key = `${topicId}-m-${milestoneIndex}`;
  user.completedMilestones = user.completedMilestones || [];
  if (!user.completedMilestones.includes(key)) {
    user.completedMilestones.push(key);
    user.markModified('completedMilestones');
  }
  await user.save();

  return successResponse(res, 200, 'Milestone completed.', { completed: true });
});

// @desc   Complete a project
// @route  PUT /api/projects/:id/complete
// @access Private
export const completeProject = asyncHandler(async (req, res) => {
  const { topicId } = req.body;
  if (!topicId) return errorResponse(res, 400, 'topicId is required.');

  const user = await User.findById(req.user._id);
  if (!user) return errorResponse(res, 404, 'User not found.');

  user.completedProjects = user.completedProjects || [];
  if (!user.completedProjects.includes(topicId)) {
    user.completedProjects.push(topicId);
  }
  await user.save();

  return successResponse(res, 200, 'Project completed!', { completed: true });
});

// @desc   Get user's project progress
// @route  GET /api/projects/progress
// @access Private
export const getProjectProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('unlockedProjects completedProjects completedMilestones xp');
  if (!user) return errorResponse(res, 404, 'User not found.');

  return successResponse(res, 200, 'Progress retrieved.', {
    unlockedProjects: user.unlockedProjects || [],
    completedProjects: user.completedProjects || [],
    completedMilestones: user.completedMilestones || [],
    xp: user.xp || 0,
  });
});