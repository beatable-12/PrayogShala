/**
 * src/types/index.ts
 * Centralized TypeScript types for PrayogShala
 * Re-exports all types from organized modules
 * 
 * Organization:
 * - user.ts: User, Language, AuthResponse, LoginPayload, RegisterPayload
 * - module.ts: Module, Topic, Difficulty, ValidationQuiz, TestCase, Subtask, ProjectTemplate, ProgrammingLanguage
 * - project.ts: Project, ProjectSpec, Milestone, MilestoneGenerationResponse
 * - submission.ts: Submission, ExecutionResult, SubmitCodePayload, SubmissionStatus
 * - viva.ts: VivaSession, VivaQuestion, VivaMessage, VivaStatus, VivaStartPayload, VivaAnswerPayload, VivaResponse
 * - skill.ts: SkillReport, ProfileProgress, Badge, ScoreBreakdown
 * - api.ts: ApiResponse, PaginatedResponse, ApiError
 * - ai.ts: AI service types (Gemini, Sarvam)
 * - store.ts: AuthStore, EditorStore
 * - error.ts: PrayogShalaError
 */

// User types
export type { User, Language, AuthResponse, LoginPayload, RegisterPayload } from './user';

// Module & Topic types
export type {
  Module,
  Difficulty,
  ValidationQuiz,
  TestCase,
  Subtask,
  ProjectTemplate,
  Topic,
  ProgrammingLanguage,
} from './module';

// Project types
export type { Project, ProjectSpec, Milestone, MilestoneGenerationResponse } from './project';

// Submission types
export type {
  Submission,
  ExecutionResult,
  SubmitCodePayload,
  SubmissionStatus,
  RuntimeAnalysis,
  MemoryAnalysis,
  TestCaseResult,
  ExecutionAnalysis,
} from './submission';

// Viva types
export type {
  VivaCodeAnalysis,
  VivaQuestion,
  VivaMessage,
  VivaSession,
  VivaStatus,
  VivaStartPayload,
  VivaStartResponse,
  VivaAnswerPayload,
  VivaAnswerResponse,
  VivaCompleteResponse,
} from './viva';

// Skill & Progress types
export type { SkillReport, ProfileProgress, Badge, ScoreBreakdown } from './skill';

// API types
export type { ApiResponse, PaginatedResponse } from './api';
export type { ApiError } from './error';

// AI service types
export type {
  Language,
  ConceptExplanationRequest,
  ConceptExplanation,
  HintGenerationRequest,
  HintResponse,
  CodeReviewRequest,
  CodeReviewResponse,
  CodeAnalysisRequest,
  SarvamCodeAnalysis,
  VivaQuestionGenerationRequest,
  VivaQuestionResponse,
  VivaEvaluationRequest,
  VivaEvaluationResponse,
  TranslationRequest,
  TranslationResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
  ProjectGenerationRequest,
  GeminiProjectResponse,
  MilestoneGenerationRequest,
  MilestoneGenerationResponse,
  Judge0SubmissionRequest,
  Judge0Response,
  RuntimeAnalysis,
  MemoryAnalysis,
  TestCaseResult,
  ExecutionAnalysis,
} from './ai';

// Store types
export type { AuthStore, EditorStore } from './store';

// Error class
export { PrayogShalaError } from './error';

