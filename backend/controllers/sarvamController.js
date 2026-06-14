import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import * as sarvamService from '../services/sarvamService.js';

const SUPPORTED_LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi'];

// ──────────────────────────────────────────────
// PRAYOG MENTOR — 7 Actions
// ──────────────────────────────────────────────

export const mentorExplain = asyncHandler(async (req, res) => {
  const { topicTitle, language } = req.body;
  if (!topicTitle) return errorResponse(res, 400, 'topicTitle is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  const result = await sarvamService.explainConcept(topicTitle, lang);
  return successResponse(res, 200, 'Problem explained.', result);
});

export const mentorApproach = asyncHandler(async (req, res) => {
  const { topicTitle, language } = req.body;
  if (!topicTitle) return errorResponse(res, 400, 'topicTitle is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  const result = await sarvamService.suggestApproach(topicTitle, lang);
  return successResponse(res, 200, 'Approach suggested.', result);
});

export const mentorComplexity = asyncHandler(async (req, res) => {
  const { topicTitle, language } = req.body;
  if (!topicTitle) return errorResponse(res, 400, 'topicTitle is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  const result = await sarvamService.analyzeComplexity(topicTitle, lang);
  return successResponse(res, 200, 'Complexity analyzed.', result);
});

export const mentorHint = asyncHandler(async (req, res) => {
  const { topicTitle, hintLevel = 1, language } = req.body;
  if (!topicTitle) return errorResponse(res, 400, 'topicTitle is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  const level = Math.min(Math.max(parseInt(hintLevel, 10) || 1, 1), 5);
  const result = await sarvamService.generateHint(topicTitle, level, lang);
  return successResponse(res, 200, 'Hint generated.', result);
});

export const mentorDebug = asyncHandler(async (req, res) => {
  const { code, topicTitle, language } = req.body;
  if (!code) return errorResponse(res, 400, 'code is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  const result = await sarvamService.debugCode(code, topicTitle || 'current problem', lang);
  return successResponse(res, 200, 'Debug analysis complete.', result);
});

export const mentorReview = asyncHandler(async (req, res) => {
  const { code, topicTitle, language } = req.body;
  if (!code) return errorResponse(res, 400, 'code is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  const result = await sarvamService.reviewSolution(code, topicTitle || 'current problem', lang);
  return successResponse(res, 200, 'Solution reviewed.', result);
});

export const mentorViva = asyncHandler(async (req, res) => {
  const { topicTitle, language } = req.body;
  if (!topicTitle) return errorResponse(res, 400, 'topicTitle is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  const result = await sarvamService.generateVivaQuestions(topicTitle, lang);
  return successResponse(res, 200, 'Viva questions generated.', result);
});

// ──────────────────────────────────────────────
// LEGACY: Basic explain
// ──────────────────────────────────────────────

export const explain = asyncHandler(async (req, res) => {
  const { topic, language } = req.body;
  if (!topic || !topic.trim()) return errorResponse(res, 400, 'topic is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  try {
    const result = await sarvamService.explainConcept(topic.trim(), lang);
    return successResponse(res, 200, 'Concept explained.', {
      topic: topic.trim(),
      language: lang,
      explanation: result.explanation || '',
      examples: result.exampleWalkthrough ? [result.exampleWalkthrough] : [],
      hints: [],
      commonMistakes: [],
    });
  } catch (err) {
    return errorResponse(res, 502, `Sarvam API error: ${err.message}`);
  }
});

// ──────────────────────────────────────────────
// TTS
// ──────────────────────────────────────────────

export const textToSpeech = asyncHandler(async (req, res) => {
  const { text, language } = req.body;
  if (!text) return errorResponse(res, 400, 'text is required.');
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
  try {
    const result = await sarvamService.textToSpeech(text, lang);
    return successResponse(res, 200, 'Audio generated.', {
      audioBase64: result.audioBase64,
      language: lang,
    });
  } catch (err) {
    return errorResponse(res, 502, `TTS error: ${err.message}`);
  }
});