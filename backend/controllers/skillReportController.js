import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import SkillReport from '../models/SkillReport.js';
import Submission from '../models/Submission.js';
import Viva from '../models/Viva.js';
import Topic from '../models/Topic.js';
import User from '../models/User.js';
import crypto from 'crypto';

/**
 * controllers/skillReportController.js
 *
 * generateReport      → Creates a SkillReport after successful viva (composite credential)
 * getReportById       → Retrieves a single skill report (student or public verification)
 * getUserReports      → Lists all skill reports earned by current user
 * verifyReport        → Public verification of certificate using certificateId
 * getAllReports       → Admin endpoint to view all issued certificates
 *
 * A SkillReport is issued when:
 *  - Student completes quiz validation (20% weight)
 *  - Code passes all test cases (40% weight)
 *  - Viva session is completed and passed (40% weight)
 */

// @desc   Generate a skill report after successful completion
// @route  POST /api/skill-reports
// @access Private
export const generateReport = asyncHandler(async (req, res) => {
  const { submissionId, vivaId, topicId } = req.body;

  // Validate that all three learning stages are complete
  const submission = await Submission.findOne({
    _id: submissionId,
    user: req.user._id,
  });
  const viva = await Viva.findOne({
    _id: vivaId,
    user: req.user._id,
    status: 'completed',
  });
  const topic = await Topic.findById(topicId);

  if (!submission || !viva || !topic) {
    return errorResponse(res, 404, 'One or more required records not found.');
  }

  if (!submission.isAccepted) {
    return errorResponse(
      res,
      400,
      'Submission must be accepted before issuing a report.'
    );
  }

  if (!viva.isPassed) {
    return errorResponse(res, 400, 'Viva must be passed to issue a report.');
  }

  // Check if a report already exists for this combination
  const existingReport = await SkillReport.findOne({
    user: req.user._id,
    topic: topicId,
    submission: submissionId,
  });

  if (existingReport) {
    return successResponse(res, 200, 'Skill report already exists.', {
      skillReport: existingReport,
    });
  }

  // Generate unique certificate ID
  const certificateId = `SR-${req.user._id.toString().slice(-8)}-${topicId
    .toString()
    .slice(-8)}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  // Calculate weighted scores
  const conceptValidationScore = submission.score || 0; // Quiz score from earlier
  const codeExecutionScore = submission.score || 0;     // Test pass percentage
  const vivaScore = viva.totalScore || 0;               // Viva performance (0–100)

  const skillReport = await SkillReport.create({
    user: req.user._id,
    topic: topicId,
    submission: submissionId,
    viva: vivaId,
    breakdown: {
      conceptValidation: conceptValidationScore,
      codeExecution: codeExecutionScore,
      vivaScore,
    },
    certificateId,
    languageUsed: req.user.preferredLang,
  });

  // Add to user's completedTopics if not already there
  await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { completedTopics: topicId } },
    { new: true }
  );

  return successResponse(res, 201, 'Skill report generated successfully.', {
    skillReport,
    certificateId: skillReport.certificateId,
  });
});

// @desc   Get a single skill report by ID
// @route  GET /api/skill-reports/:id
// @access Private
export const getReportById = asyncHandler(async (req, res) => {
  const skillReport = await SkillReport.findById(req.params.id)
    .populate('user', 'name email preferredLang')
    .populate('topic', 'title slug difficulty')
    .populate('submission', 'code language status score testsPassed testsTotal')
    .populate('viva', 'totalScore feedback messages status');

  if (!skillReport) {
    return errorResponse(res, 404, 'Skill report not found.');
  }

  // Authorization: user can view their own report, or anyone can view if verified
  if (
    skillReport.user._id.toString() !== req.user._id.toString() &&
    !skillReport.isVerified
  ) {
    return errorResponse(res, 403, 'Access denied.');
  }

  return successResponse(res, 200, 'Skill report retrieved.', { skillReport });
});

// @desc   Get all skill reports for the current user
// @route  GET /api/skill-reports
// @access Private
export const getUserReports = asyncHandler(async (req, res) => {
  const skillReports = await SkillReport.find({ user: req.user._id })
    .populate('topic', 'title slug difficulty')
    .populate('viva', 'totalScore status')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'User skill reports retrieved.', {
    count: skillReports.length,
    skillReports,
  });
});

// @desc   Verify a certificate by public certificate ID (no auth required)
// @route  GET /api/skill-reports/verify/:certificateId
// @access Public
export const verifyReport = asyncHandler(async (req, res) => {
  const skillReport = await SkillReport.findOne({
    certificateId: req.params.certificateId,
    isVerified: true,
  })
    .populate('user', 'name email')
    .populate('topic', 'title slug difficulty xpReward')
    .select(
      'user topic overallScore breakdown languageUsed certificateId issuedAt'
    );

  if (!skillReport) {
    return errorResponse(res, 404, 'Certificate not found or not verified.');
  }

  return successResponse(res, 200, 'Certificate verified.', { skillReport });
});

// @desc   Get all issued skill reports (Admin only)
// @route  GET /api/skill-reports/admin/all
// @access Private/Admin
export const getAllReports = asyncHandler(async (req, res) => {
  const filter = { isVerified: true };

  // Optional filters
  if (req.query.userId) filter.user = req.query.userId;
  if (req.query.topicId) filter.topic = req.query.topicId;

  const skillReports = await SkillReport.find(filter)
    .populate('user', 'name email')
    .populate('topic', 'title slug')
    .sort({ issuedAt: -1 });

  return successResponse(res, 200, 'All skill reports retrieved.', {
    count: skillReports.length,
    skillReports,
  });
});
