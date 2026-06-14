import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import * as executionService from '../services/executionService.js';

export const execute = asyncHandler(async (req, res) => {
  const { topicId, projectId, sourceCode, language } = req.body;
  const userId = req.user._id;

  if (!sourceCode || !sourceCode.trim()) {
    return errorResponse(res, 400, 'sourceCode is required and cannot be empty.');
  }
  if (!language) {
    return errorResponse(res, 400, 'language is required.');
  }
  if (!topicId) {
    return errorResponse(res, 400, 'topicId is required.');
  }

  try {
    const submission = await executionService.executeCode({
      userId,
      topicId,
      projectId,
      sourceCode,
      language,
    });

    return successResponse(res, 200, 'Code executed successfully.', { submission });
  } catch (err) {
    return errorResponse(res, 500, `Execution failed: ${err.message}`);
  }
});

export const getResult = asyncHandler(async (req, res) => {
  try {
    const submission = await executionService.getExecutionResult(req.params.id, req.user._id);
    return successResponse(res, 200, 'Execution result retrieved.', { submission });
  } catch (err) {
    return errorResponse(res, err.statusCode || 500, err.message);
  }
});
