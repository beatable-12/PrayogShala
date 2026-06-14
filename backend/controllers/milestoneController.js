import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import * as geminiService from '../services/geminiService.js';
import Project from '../models/Project.js';

const VALID_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

export const generateMilestones = asyncHandler(async (req, res) => {
  const { projectId, numberOfMilestones, difficulty } = req.body;

  if (!projectId) {
    return errorResponse(res, 400, 'projectId is required.');
  }

  const project = await Project.findOne({ _id: projectId, userId: req.user._id });
  if (!project) {
    return errorResponse(res, 404, 'Project not found.');
  }

  const diff = (difficulty || project.difficulty || 'MEDIUM').toUpperCase();
  if (!VALID_DIFFICULTIES.includes(diff)) {
    return errorResponse(res, 400, `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }

  const count = Math.min(Math.max(Number(numberOfMilestones) || 5, 3), 10);

  const result = await geminiService.generateMilestones(
    project.title,
    project.description,
    count,
    diff
  );

  project.milestones = result.milestones;
  project.subtasks = result.subtasks;
  project.completionChecklist = result.completionChecklist;
  await project.save();

  return successResponse(res, 200, 'Milestones generated successfully.', {
    milestones: project.milestones,
    subtasks: project.subtasks,
    completionChecklist: project.completionChecklist,
  });
});
