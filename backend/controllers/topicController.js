import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import Topic from '../models/Topic.js';
import User from '../models/User.js';
import { translateText, textToSpeech } from '../services/sarvamService.js';

/**
 * controllers/topicController.js
 *
 * getAllTopics       → List all published topics (optionally filtered by module)
 * getTopicBySlug    → Full topic detail including concept text
 * explainTopic      → Translates concept text to user's native language via Sarvam AI
 * speakTopic        → Converts translated text to TTS audio via Sarvam AI
 * validateAnswer    → Checks student's quiz answer, unlocks project on pass
 * createTopic       → Admin: create topic
 * updateTopic       → Admin: update topic
 * deleteTopic       → Admin: delete topic
 */

// @desc   Get all published topics (filter by ?module=moduleId)
// @route  GET /api/topics
// @access Public
export const getAllTopics = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.module) filter.module = req.query.module;

  const topics = await Topic.find(filter)
    .select('-validationQuiz.correctAnswer -projectTemplate.testCases') // Hide answers
    .sort('order');

  return successResponse(res, 200, 'Topics retrieved.', { count: topics.length, topics });
});

// @desc   Get a single topic by slug
// @route  GET /api/topics/:slug
// @access Public
export const getTopicBySlug = asyncHandler(async (req, res) => {
  const topic = await Topic.findOne({ slug: req.params.slug, isPublished: true })
    .select('-validationQuiz.correctAnswer') // Never expose the answer
    .populate('module', 'title order');

  if (!topic) return errorResponse(res, 404, 'Topic not found.');
  return successResponse(res, 200, 'Topic retrieved.', { topic });
});

// @desc   Translate topic concept text to user's preferred language (Sarvam AI)
// @route  POST /api/topics/:slug/explain
// @access Private
export const explainTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findOne({ slug: req.params.slug });
  if (!topic) return errorResponse(res, 404, 'Topic not found.');

  const targetLang = req.body.language || req.user.preferredLang || 'English';
  const result = await translateText(topic.conceptText, targetLang);

  return successResponse(res, 200, 'Concept translated.', {
    originalText: topic.conceptText,
    translatedText: result.translatedText,
    language: targetLang,
    topicTitle: topic.title,
  });
});

// @desc   Convert text to speech audio via Sarvam TTS
// @route  POST /api/topics/:slug/speak
// @access Private
export const speakTopic = asyncHandler(async (req, res) => {
  const { text, language } = req.body;
  if (!text) return errorResponse(res, 400, 'Text is required for TTS.');

  const targetLang = language || req.user.preferredLang || 'English';
  const result = await textToSpeech(text, targetLang);

  return successResponse(res, 200, 'Audio generated.', {
    audioBase64: result.audioBase64,
    language: targetLang,
  });
});

// @desc   Validate student quiz answer — unlock project if correct
// @route  POST /api/topics/:slug/validate
// @access Private
export const validateAnswer = asyncHandler(async (req, res) => {
  const topic = await Topic.findOne({ slug: req.params.slug });
  if (!topic) return errorResponse(res, 404, 'Topic not found.');
  if (!topic.validationQuiz) return errorResponse(res, 400, 'No validation quiz for this topic.');

  const { answer } = req.body;
  if (!answer) return errorResponse(res, 400, 'Answer is required.');

  const isCorrect =
    answer.trim().toLowerCase() === topic.validationQuiz.correctAnswer.trim().toLowerCase();

  if (isCorrect) {
    // Add to user's unlocked topics if not already unlocked
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { unlockedTopics: topic._id } },
      { new: true }
    );
  }

  return successResponse(res, 200, isCorrect ? 'Correct! Project unlocked.' : 'Incorrect answer.', {
    isCorrect,
    explanation: topic.validationQuiz.explanation || null,
    projectUnlocked: isCorrect,
    ...(isCorrect && { projectTemplate: topic.projectTemplate }),
  });
});

// @desc   Create a topic (Admin)
// @route  POST /api/topics
// @access Private/Admin
export const createTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.create(req.body);

  // Push topic ref into parent module
  if (req.body.module) {
    const { Module } = await import('../models/Module.js');
    await Module.findByIdAndUpdate(req.body.module, {
      $push: { topics: topic._id },
      $inc: { totalLessons: 1 },
    });
  }

  return successResponse(res, 201, 'Topic created.', { topic });
});

// @desc   Update topic (Admin)
// @route  PUT /api/topics/:id
// @access Private/Admin
export const updateTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!topic) return errorResponse(res, 404, 'Topic not found.');
  return successResponse(res, 200, 'Topic updated.', { topic });
});

// @desc   Delete topic (Admin)
// @route  DELETE /api/topics/:id
// @access Private/Admin
export const deleteTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findByIdAndDelete(req.params.id);
  if (!topic) return errorResponse(res, 404, 'Topic not found.');
  return successResponse(res, 200, 'Topic deleted.');
});
