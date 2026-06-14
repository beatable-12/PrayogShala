import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import * as submissionService from '../services/submissionService.js';

export const createSubmission = asyncHandler(async (req, res) => {
  const { topicId, projectId, sourceCode, language } = req.body;
  const userId = req.user._id;

  if (!topicId) {
    return errorResponse(res, 400, 'topicId is required.');
  }
  if (!sourceCode || !sourceCode.trim()) {
    return errorResponse(res, 400, 'sourceCode is required and cannot be empty.');
  }

  try {
    const submission = await submissionService.createSubmission({
      userId,
      topicId,
      projectId,
      sourceCode,
      language,
    });

    return successResponse(res, 201, 'Submission created successfully.', { submission });
  } catch (err) {
    const status = err.statusCode || 500;
    return errorResponse(res, status, err.message);
  }
});

export const getSubmissionById = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const submission = await submissionService.getSubmissionById(req.params.id, userId);
    return successResponse(res, 200, 'Submission retrieved.', { submission });
  } catch (err) {
    const status = err.statusCode || 500;
    return errorResponse(res, status, err.message);
  }
});

export const getUserSubmissions = asyncHandler(async (req, res) => {
  const params = {
    userId: req.params.userId,
    topicId: req.query.topicId,
    projectId: req.query.projectId,
    status: req.query.status,
    page: parseInt(req.query.page, 10) || 1,
    limit: Math.min(parseInt(req.query.limit, 10) || 20, 100),
  };

  try {
    const result = await submissionService.getUserSubmissions(params);
    return successResponse(res, 200, 'Submissions retrieved.', result);
  } catch (err) {
    return errorResponse(res, err.statusCode || 500, err.message);
  }
});
