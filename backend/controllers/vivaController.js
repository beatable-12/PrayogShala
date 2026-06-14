import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import Viva from '../models/Viva.js';
import User from '../models/User.js';
import * as vivaService from '../services/sarvamVivaService.js';

const TOTAL_QUESTIONS = 5;

export const startVivaSession = asyncHandler(async (req, res) => {
  const { submissionId, sourceCode, topicTitle, projectTitle, runtime, memory, status } = req.body;

  if (!sourceCode || !topicTitle) {
    return errorResponse(res, 400, 'sourceCode and topicTitle are required.');
  }

  const analysis = await vivaService.analyzeCode(
    sourceCode, topicTitle, runtime || 0, memory || 0, status || 'accepted'
  );

  const firstQuestion = await vivaService.generateQuestion(analysis, [], 1);

  const viva = await Viva.create({
    userId: req.user._id,
    submissionId: submissionId || null,
    topicId: null,
    codeAnalysis: {
      algorithmsUsed: analysis.algorithmsUsed,
      dataStructuresUsed: analysis.dataStructuresUsed,
      optimizations: analysis.optimizations,
      timeComplexity: analysis.timeComplexity,
      spaceComplexity: analysis.spaceComplexity,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions,
    },
    executionContext: {
      runtime: runtime || 0,
      memory: memory || 0,
      status: status || 'accepted',
    },
    messages: [{
      role: 'sarvam',
      content: firstQuestion.question,
      category: firstQuestion.category,
      difficulty: firstQuestion.difficulty,
    }],
    status: 'in_progress',
  });

  return successResponse(res, 201, 'Viva session started.', {
    vivaSessionId: viva._id,
    firstQuestion: {
      id: firstQuestion.id,
      order: 1,
      question: firstQuestion.question,
      category: firstQuestion.category,
      difficulty: firstQuestion.difficulty,
    },
    codeAnalysis: analysis,
    totalQuestions: TOTAL_QUESTIONS,
    currentQuestion: 1,
  });
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  if (!answer?.trim()) return errorResponse(res, 400, 'Answer cannot be empty.');

  const viva = await Viva.findOne({ _id: req.params.id, userId: req.user._id });
  if (!viva) return errorResponse(res, 404, 'Viva session not found.');
  if (viva.status !== 'in_progress') return errorResponse(res, 400, 'Viva is already completed.');

  const lastQuestion = [...viva.messages].reverse().find(m => m.role === 'sarvam');
  if (!lastQuestion) return errorResponse(res, 400, 'No active question found.');

  const evaluation = await vivaService.evaluateAnswer(
    lastQuestion.content,
    answer,
    [],
    viva.codeAnalysis
  );

  viva.messages.push({
    role: 'student',
    content: answer,
    score: evaluation.score,
  });

  const answeredCount = viva.messages.filter(m => m.role === 'student').length;
  const nextLevel = answeredCount + 1;
  let nextQuestion = null;

  if (nextLevel <= TOTAL_QUESTIONS) {
    nextQuestion = await vivaService.generateQuestion(viva.codeAnalysis, viva.messages, nextLevel);
    viva.messages.push({
      role: 'sarvam',
      content: nextQuestion.question,
      category: nextQuestion.category,
      difficulty: nextQuestion.difficulty,
    });
  }

  if (!nextQuestion || answeredCount >= TOTAL_QUESTIONS) {
    const scores = viva.messages.filter(m => m.role === 'student' && m.score != null).map(m => m.score);
    viva.totalScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10)
      : 0;

    const conceptScore = Math.round((evaluation.conceptScore || evaluation.score) * 2.5);
    const codeScore = Math.round((evaluation.codeKnowledgeScore || evaluation.score) * 2.5);
    const optScore = Math.round((evaluation.optimizationScore || evaluation.score) * 2.5);
    const psScore = Math.round((evaluation.problemSolvingScore || evaluation.score) * 2.5);

    viva.feedback = JSON.stringify({
      overallScore: Math.min(100, conceptScore + codeScore + optScore + psScore),
      conceptUnderstanding: conceptScore,
      codeKnowledge: codeScore,
      optimizationAwareness: optScore,
      problemSolving: psScore,
    });
    viva.status = 'completed';
  }

  await viva.save();

  return successResponse(res, 200, nextQuestion ? 'Answer submitted.' : 'Viva completed!', {
    answerScore: evaluation.score,
    answerFeedback: evaluation.feedback,
    keyPointsCovered: evaluation.keyPointsCovered || [],
    keyPointsMissed: evaluation.keyPointsMissed || [],
    nextQuestion: nextQuestion ? {
      id: nextQuestion.id,
      order: nextQuestion.order,
      question: nextQuestion.question,
      category: nextQuestion.category,
      difficulty: nextQuestion.difficulty,
    } : null,
    isCompleted: viva.status === 'completed',
    progress: {
      current: answeredCount,
      total: TOTAL_QUESTIONS,
    },
    finalScore: viva.status === 'completed' ? viva.totalScore : null,
  });
});

export const completeViva = asyncHandler(async (req, res) => {
  const viva = await Viva.findOne({ _id: req.params.id, userId: req.user._id });
  if (!viva) return errorResponse(res, 404, 'Viva session not found.');
  if (viva.status !== 'in_progress') return errorResponse(res, 400, 'Viva is already completed.');

  const scores = viva.messages.filter(m => m.role === 'student' && m.score != null).map(m => m.score);
  viva.totalScore = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10)
    : 0;

  const feedback = await vivaService.generateFeedback(viva.messages, viva.codeAnalysis);
  viva.feedback = feedback.summary;
  viva.status = 'completed';
  await viva.save();

  // Update user profile
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { xp: viva.totalScore * 5 },
  });

  return successResponse(res, 200, 'Viva completed.', {
    totalScore: viva.totalScore,
    feedback,
    codeAnalysis: viva.codeAnalysis,
  });
});

export const getVivaResult = asyncHandler(async (req, res) => {
  const viva = await Viva.findOne({ _id: req.params.id, userId: req.user._id });
  if (!viva) return errorResponse(res, 404, 'Viva session not found.');

  const questions = viva.messages.filter(m => m.role === 'sarvam');
  const answers = viva.messages.filter(m => m.role === 'student');

  let scoreBreakdown = {};
  try {
    scoreBreakdown = JSON.parse(viva.feedback || '{}');
  } catch { /* ignore */ }

  return successResponse(res, 200, 'Viva result retrieved.', {
    viva: {
      _id: viva._id,
      status: viva.status,
      totalScore: viva.totalScore,
      isPassed: viva.isPassed,
      codeAnalysis: viva.codeAnalysis,
      executionContext: viva.executionContext,
      questions,
      answers,
      scoreBreakdown: {
        overallScore: scoreBreakdown.overallScore || viva.totalScore,
        conceptUnderstanding: scoreBreakdown.conceptUnderstanding || Math.round(viva.totalScore * 0.25),
        codeKnowledge: scoreBreakdown.codeKnowledge || Math.round(viva.totalScore * 0.25),
        optimizationAwareness: scoreBreakdown.optimizationAwareness || Math.round(viva.totalScore * 0.25),
        problemSolving: scoreBreakdown.problemSolving || Math.round(viva.totalScore * 0.25),
      },
      createdAt: viva.createdAt,
      completedAt: viva.updatedAt,
    },
  });
});

export const getVivaById = asyncHandler(async (req, res) => {
  const viva = await Viva.findOne({ _id: req.params.id, userId: req.user._id });
  if (!viva) return errorResponse(res, 404, 'Viva session not found.');
  return successResponse(res, 200, 'Viva retrieved.', { viva });
});

export const getUserVivas = asyncHandler(async (req, res) => {
  const vivas = await Viva.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return successResponse(res, 200, 'Viva sessions retrieved.', { count: vivas.length, vivas });
});