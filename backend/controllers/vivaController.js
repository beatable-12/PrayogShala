import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import Viva from '../models/Viva.js';
import Submission from '../models/Submission.js';
import Topic from '../models/Topic.js';
import { startViva, evaluateAnswer, generateFinalFeedback } from '../services/geminiService.js';

/**
 * controllers/vivaController.js
 *
 * startVivaSession   → Creates a new Viva document, Gemini generates first question
 * submitAnswer       → Student submits answer, Gemini evaluates + gives next question
 * completeViva       → Finalizes the viva, Gemini writes overall feedback summary
 * getVivaById        → Fetch a viva session (for resume or review)
 * getUserVivas       → List all viva sessions for the current user
 */

// @desc   Start a new AI Code-Aware Viva session
// @route  POST /api/viva/start
// @access Private
export const startVivaSession = asyncHandler(async (req, res) => {
  const { submissionId } = req.body;

  const submission = await Submission.findOne({
    _id: submissionId,
    user: req.user._id,
  }).populate('topic');

  if (!submission) {
    return errorResponse(res, 404, 'Submission not found.');
  }
  if (!submission.isAccepted) {
    return errorResponse(res, 400, 'Only accepted submissions can proceed to a Viva.');
  }

  // Check for an existing in-progress viva for this submission
  const existingViva = await Viva.findOne({
    submission: submissionId,
    user: req.user._id,
    status: 'in_progress',
  });
  if (existingViva) {
    return successResponse(res, 200, 'Resumed existing viva session.', { viva: existingViva });
  }

  // Ask Gemini to generate the first question based on the student's code
  const geminiResponse = await startViva(
    submission.code,
    submission.topic.title,
    req.user.preferredLang
  );

  const firstQuestion = geminiResponse.question || 'Explain the core logic of your solution.';

  const viva = await Viva.create({
    user: req.user._id,
    submission: submissionId,
    topic: submission.topic._id,
    messages: [{ role: 'gemini', content: firstQuestion }],
    status: 'in_progress',
  });

  return successResponse(res, 201, 'Viva session started.', {
    viva,
    currentQuestion: firstQuestion,
  });
});

// @desc   Submit an answer to the current viva question
// @route  POST /api/viva/:id/answer
// @access Private
export const submitAnswer = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  if (!answer?.trim()) return errorResponse(res, 400, 'Answer cannot be empty.');

  const viva = await Viva.findOne({ _id: req.params.id, user: req.user._id });
  if (!viva) return errorResponse(res, 404, 'Viva session not found.');
  if (viva.status !== 'in_progress') {
    return errorResponse(res, 400, 'This viva session is already completed.');
  }

  const submission = await Submission.findById(viva.submission);
  const topic = await Topic.findById(viva.topic);

  // Get the last question that Gemini asked
  const lastGeminiMsg = [...viva.messages].reverse().find((m) => m.role === 'gemini');
  if (!lastGeminiMsg) return errorResponse(res, 400, 'No question found to answer.');

  // Gemini evaluates the answer
  const evaluation = await evaluateAnswer(
    submission.code,
    lastGeminiMsg.content,
    answer,
    topic.title
  );

  const score = evaluation.score ?? 5;
  const feedback = evaluation.feedback ?? 'Answer recorded.';
  const nextQuestion = evaluation.nextQuestion ?? null;

  // Record student's answer with its score
  viva.messages.push({ role: 'student', content: answer, score });

  // If Gemini provided a follow-up question, add it
  if (nextQuestion) {
    viva.messages.push({ role: 'gemini', content: nextQuestion });
  }

  // If no next question — auto-complete after max 3 rounds (6 messages = 3 Q&A pairs)
  const studentAnswerCount = viva.messages.filter((m) => m.role === 'student').length;
  const shouldComplete = !nextQuestion || studentAnswerCount >= 3;

  if (shouldComplete) {
    // Compute total score from all student answers
    const answerScores = viva.messages
      .filter((m) => m.role === 'student' && m.score !== null)
      .map((m) => m.score);
    const avgScore = answerScores.length
      ? Math.round((answerScores.reduce((a, b) => a + b, 0) / answerScores.length) * 10)
      : 50;

    // Get Gemini's overall performance summary
    const finalFeedback = await generateFinalFeedback(viva.messages, topic.title);

    viva.totalScore = avgScore;
    viva.feedback = finalFeedback.summary || feedback;
    viva.status = 'completed';
  }

  await viva.save();

  return successResponse(
    res,
    200,
    shouldComplete ? 'Viva completed!' : 'Answer submitted.',
    {
      viva,
      answerFeedback: feedback,
      answerScore: score,
      nextQuestion: shouldComplete ? null : nextQuestion,
      isCompleted: shouldComplete,
    }
  );
});

// @desc   Manually complete/abandon a viva session
// @route  PATCH /api/viva/:id/complete
// @access Private
export const completeViva = asyncHandler(async (req, res) => {
  const viva = await Viva.findOne({ _id: req.params.id, user: req.user._id });
  if (!viva) return errorResponse(res, 404, 'Viva session not found.');

  const topic = await Topic.findById(viva.topic);
  const finalFeedback = await generateFinalFeedback(viva.messages, topic.title);

  const answerScores = viva.messages
    .filter((m) => m.role === 'student' && m.score !== null)
    .map((m) => m.score);

  viva.totalScore = answerScores.length
    ? Math.round((answerScores.reduce((a, b) => a + b, 0) / answerScores.length) * 10)
    : 0;
  viva.feedback = finalFeedback.summary || 'Viva completed.';
  viva.status = 'completed';
  await viva.save();

  return successResponse(res, 200, 'Viva finalized.', { viva });
});

// @desc   Get a specific viva session
// @route  GET /api/viva/:id
// @access Private
export const getVivaById = asyncHandler(async (req, res) => {
  const viva = await Viva.findOne({ _id: req.params.id, user: req.user._id })
    .populate('topic', 'title slug difficulty')
    .populate('submission', 'code language status score');

  if (!viva) return errorResponse(res, 404, 'Viva session not found.');
  return successResponse(res, 200, 'Viva retrieved.', { viva });
});

// @desc   List all viva sessions for current user
// @route  GET /api/viva
// @access Private
export const getUserVivas = asyncHandler(async (req, res) => {
  const vivas = await Viva.find({ user: req.user._id })
    .populate('topic', 'title slug')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Viva sessions retrieved.', {
    count: vivas.length,
    vivas,
  });
});
