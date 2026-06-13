import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import Submission from '../models/Submission.js';
import Topic from '../models/Topic.js';
import User from '../models/User.js';
import { runAndWait, submitCode, getResult } from '../services/judge0Service.js';
import { LANGUAGE_IDS } from '../models/Submission.js';

/**
 * controllers/submissionController.js
 *
 * submitCode      → Sends code to Judge0, stores submission record, returns result
 * getSubmissions  → List user's submission history for a topic
 * getSubmissionById → Single submission detail
 * pollSubmission  → Poll Judge0 by stored token for async frontend polling
 */

// @desc   Submit code to Judge0 and record result
// @route  POST /api/submissions
// @access Private
export const submitCodeHandler = asyncHandler(async (req, res) => {
  const { topicId, code, language, stdin } = req.body;

  const topic = await Topic.findById(topicId);
  if (!topic) return errorResponse(res, 404, 'Topic not found.');

  const languageId = LANGUAGE_IDS[language];
  if (!languageId) return errorResponse(res, 400, `Unsupported language: ${language}`);

  // Create a pending submission record immediately
  const submission = await Submission.create({
    user: req.user._id,
    topic: topicId,
    code,
    language,
    status: 'pending',
  });

  try {
    // Run all test cases and aggregate results
    const testCases = topic.projectTemplate?.testCases || [];
    let testsPassed = 0;

    // Run against first test case (or blank stdin if no test cases)
    const firstInput = testCases[0]?.input || stdin || '';
    const result = await runAndWait(code, languageId, firstInput);

    // Simple output matching for visible test cases
    for (const tc of testCases.filter((t) => !t.isHidden)) {
      const tcResult = await runAndWait(code, languageId, tc.input);
      if (tcResult.stdout.trim() === tc.expectedOutput.trim()) {
        testsPassed++;
      }
    }

    // Update submission with Judge0 results
    submission.judge0Token = result.token;
    submission.status = result.status;
    submission.stdout = result.stdout;
    submission.stderr = result.stderr || result.compileOutput;
    submission.executionTime = result.executionTime;
    submission.memoryUsed = result.memoryUsed;
    submission.testsPassed = testsPassed;
    submission.testsTotal = testCases.filter((t) => !t.isHidden).length || 1;
    await submission.save();

    // Award XP if accepted
    if (submission.isAccepted) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { xp: topic.xpReward },
        $addToSet: { completedTopics: topic._id },
      });
    }

    return successResponse(res, 200, 'Code executed successfully.', { submission });
  } catch (error) {
    // Mark submission as failed if Judge0 throws
    submission.status = 'failed';
    submission.stderr = error.message;
    await submission.save();
    return errorResponse(res, 500, `Execution failed: ${error.message}`);
  }
});

// @desc   Get all submissions by current user for a topic
// @route  GET /api/submissions?topicId=xxx
// @access Private
export const getSubmissions = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.topicId) filter.topic = req.query.topicId;

  const submissions = await Submission.find(filter)
    .populate('topic', 'title slug')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Submissions retrieved.', {
    count: submissions.length,
    submissions,
  });
});

// @desc   Get a single submission by ID
// @route  GET /api/submissions/:id
// @access Private
export const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('topic', 'title slug');

  if (!submission) return errorResponse(res, 404, 'Submission not found.');
  return successResponse(res, 200, 'Submission retrieved.', { submission });
});

// @desc   Poll Judge0 for current execution status (for async frontend polling)
// @route  GET /api/submissions/:id/poll
// @access Private
export const pollSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!submission) return errorResponse(res, 404, 'Submission not found.');
  if (!submission.judge0Token) {
    return errorResponse(res, 400, 'No Judge0 token for this submission.');
  }

  const result = await getResult(submission.judge0Token);

  // Update submission if execution completed
  if (result.statusId !== 1 && result.statusId !== 2) {
    submission.status = result.status;
    submission.stdout = result.stdout;
    submission.stderr = result.stderr || result.compileOutput;
    submission.executionTime = result.executionTime;
    submission.memoryUsed = result.memoryUsed;
    await submission.save();
  }

  return successResponse(res, 200, 'Submission status fetched.', { submission });
});
