import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import SkillReport from '../models/SkillReport.js';
import Submission from '../models/Submission.js';
import Viva from '../models/Viva.js';
import Topic from '../models/Topic.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import crypto from 'crypto';

// ======================================================================
// COMPREHENSIVE SKILL REPORT — Aggregates all data sources
// ======================================================================

export const getSkillReport = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return errorResponse(res, 400, 'userId is required.');
  }

  const user = await User.findById(userId);
  if (!user) {
    return errorResponse(res, 404, 'User not found.');
  }

  const existing = await SkillReport.findOne({ userId, reportType: 'comprehensive' })
    .populate('topicMastery.topicId', 'title difficulty');
  if (existing) {
    return successResponse(res, 200, 'Skill report retrieved.', { skillReport: existing });
  }

  const [submissions, vivas, topics, projects] = await Promise.all([
    Submission.find({ userId, isAccepted: true }).sort({ createdAt: -1 }),
    Viva.find({ userId, status: 'completed' }).sort({ createdAt: -1 }),
    Topic.find({}).sort({ title: 1 }),
    Project.find({ userId, status: 'completed' }).sort({ createdAt: -1 }),
  ]);

  const completedTopicIds = new Set((user.completedTopics || []).map(id => id.toString()));

  const topicMastery = await Promise.all(
    topics.map(async (topic) => {
      const topicSubmissions = submissions.filter(
        s => s.topicId && s.topicId.toString() === topic._id.toString()
      );
      const topicVivas = vivas.filter(
        v => v.topicId && v.topicId.toString() === topic._id.toString()
      );

      const bestScore = topicSubmissions.length
        ? Math.max(...topicSubmissions.map(s => s.score || 0))
        : 0;

      const vivaScore = topicVivas.length
        ? Math.round(topicVivas.reduce((sum, v) => sum + (v.totalScore || 0), 0) / topicVivas.length)
        : 0;

      const submissionsAvg = topicSubmissions.length
        ? Math.round(topicSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / topicSubmissions.length)
        : 0;

      const score = topicVivas.length
        ? Math.round(submissionsAvg * 0.5 + vivaScore * 0.5)
        : submissionsAvg;

      return {
        topicId: topic._id,
        topicTitle: topic.title,
        difficulty: topic.difficulty,
        score,
        submissionsCount: topicSubmissions.length,
        bestSubmissionScore: bestScore,
        vivaScore,
        isCompleted: completedTopicIds.has(topic._id.toString()),
      };
    })
  );

  const mastered = topicMastery.filter(t => t.score >= 70).sort((a, b) => b.score - a.score);
  const weak = topicMastery.filter(t => t.score > 0 && t.score < 50).sort((a, b) => a.score - b.score);
  const unattempted = topicMastery.filter(t => t.score === 0 && !t.isCompleted);

  const strengths = [
    ...mastered.map(t => `${t.topicTitle} (${t.score}%)`),
  ];
  const weaknesses = [
    ...weak.map(t => `${t.topicTitle} (${t.score}%)`),
    ...unattempted.map(t => `${t.topicTitle} (not attempted)`),
  ];

  const totalSubmissions = submissions.length;
  const acceptedSubmissions = submissions.filter(s => s.isAccepted).length;
  const avgCodeScore = totalSubmissions
    ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions)
    : 0;
  const avgVivaScore = vivas.length
    ? Math.round(vivas.reduce((sum, v) => sum + (v.totalScore || 0), 0) / vivas.length)
    : 0;
  const completedProjects = projects.length;
  const attemptedTopics = topicMastery.filter(t => t.submissionsCount > 0 || t.isCompleted).length;
  const conceptValidationScore = topicMastery.length
    ? Math.round((completedTopicIds.size / topicMastery.length) * 100)
    : 0;

  const readinessScore = Math.round(
    conceptValidationScore * 0.15 +
    avgCodeScore * 0.30 +
    avgVivaScore * 0.35 +
    (attemptedTopics / Math.max(topicMastery.length, 1)) * 100 * 0.20
  );

  const skillReport = await SkillReport.create({
    userId,
    reportType: 'comprehensive',
    readinessScore,
    breakdown: {
      conceptValidation: conceptValidationScore,
      codeExecution: avgCodeScore,
      vivaScore: avgVivaScore,
    },
    topicMastery,
    strengths: strengths.length ? strengths : ['Start practicing to build strengths'],
    weaknesses: weaknesses.length ? weaknesses : ['No weaknesses identified yet'],
    languageUsed: user.preferredLang || 'English',
  });

  return successResponse(res, 201, 'Skill report generated.', { skillReport });
});

// ======================================================================
// PER-TOPIC REPORT — Composite credential after viva completion
// ======================================================================

export const generateReport = asyncHandler(async (req, res) => {
  const { submissionId, vivaId, topicId } = req.body;

  const submission = await Submission.findOne({ _id: submissionId, userId: req.user._id });
  const viva = await Viva.findOne({ _id: vivaId, userId: req.user._id, status: 'completed' });
  const topic = await Topic.findById(topicId);

  if (!submission || !viva || !topic) {
    return errorResponse(res, 404, 'One or more required records not found.');
  }
  if (!submission.isAccepted) {
    return errorResponse(res, 400, 'Submission must be accepted before issuing a report.');
  }
  if (!viva.isPassed) {
    return errorResponse(res, 400, 'Viva must be passed to issue a report.');
  }

  const existingReport = await SkillReport.findOne({
    userId: req.user._id,
    topicId,
    submissionId,
    reportType: 'per_topic',
  });
  if (existingReport) {
    return successResponse(res, 200, 'Skill report already exists.', { skillReport: existingReport });
  }

  const conceptValidationScore = submission.score || 0;
  const codeExecutionScore = submission.score || 0;
  const vivaScore = viva.totalScore || 0;

  const skillReport = await SkillReport.create({
    userId: req.user._id,
    topicId,
    submissionId,
    vivaSessionId: vivaId,
    reportType: 'per_topic',
    breakdown: {
      conceptValidation: conceptValidationScore,
      codeExecution: codeExecutionScore,
      vivaScore,
    },
    languageUsed: req.user.preferredLang || 'English',
  });

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

export const getReportById = asyncHandler(async (req, res) => {
  const skillReport = await SkillReport.findById(req.params.id)
    .populate('userId', 'name email preferredLang')
    .populate('topicId', 'title slug difficulty');

  if (!skillReport) {
    return errorResponse(res, 404, 'Skill report not found.');
  }

  if (
    skillReport.userId._id.toString() !== req.user._id.toString() &&
    !skillReport.isVerified
  ) {
    return errorResponse(res, 403, 'Access denied.');
  }

  return successResponse(res, 200, 'Skill report retrieved.', { skillReport });
});

export const getUserReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [skillReports, total] = await Promise.all([
    SkillReport.find({ userId: req.user._id })
      .populate('topicId', 'title slug difficulty')
      .populate('topicMastery.topicId', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SkillReport.countDocuments({ userId: req.user._id }),
  ]);

  return successResponse(res, 200, 'User skill reports retrieved.', {
    count: skillReports.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    skillReports,
  });
});

export const verifyReport = asyncHandler(async (req, res) => {
  const skillReport = await SkillReport.findOne({
    certificateId: req.params.certificateId,
    isVerified: true,
  })
    .populate('userId', 'name email')
    .select(
      'userId reportType overallScore readinessScore breakdown topicMastery strengths weaknesses languageUsed certificateId issuedAt'
    );

  if (!skillReport) {
    return errorResponse(res, 404, 'Certificate not found or not verified.');
  }

  return successResponse(res, 200, 'Certificate verified.', { skillReport });
});

export const getAllReports = asyncHandler(async (req, res) => {
  const filter = { isVerified: true };
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.topicId) filter.topicId = req.query.topicId;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [skillReports, total] = await Promise.all([
    SkillReport.find(filter)
      .populate('userId', 'name email')
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(limit),
    SkillReport.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'All skill reports retrieved.', {
    count: skillReports.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    skillReports,
  });
});
