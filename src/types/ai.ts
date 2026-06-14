/**
 * src/types/ai.ts
 * AI architecture contracts for PrayogShala
 * 
 * Three AI services with distinct responsibilities:
 * 
 * | Service   | Responsibilities                                              |
 * |-----------|--------------------------------------------------------------|
 * | Sarvam AI | Concept Explanations, Hint Generation, Code Review,          |
 * |           | Code Analysis, Viva Generation, Viva Evaluation              |
 * | Gemini    | Project Generation, Milestone Generation                     |
 * | Judge0    | Code Execution, Runtime Analysis, Memory Analysis,           |
 * |           | Test Case Results                                            |
 * 
 * These types define the service contracts between frontend and backend,
 * and between backend and external AI APIs.
 * 
 * TODO: Move shared types to @prayogshala/types package once monorepo tooling is set up
 */

import { Subtask, TestCase } from './module';

// ========================================================================
// Language type (used across all AI services for multilingual support)
// ========================================================================

/** Supported Indian languages for multilingual content */
export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Bengali' | 'Marathi';

// ========================================================================
// SARVAM AI SERVICE CONTRACTS
// ========================================================================

// ----- 1. Concept Explanations -----

/** Request to generate a concept explanation */
export interface ConceptExplanationRequest {
  topicTitle: string;
  conceptText: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language?: Language;
}

/** Response containing a structured concept explanation */
export interface ConceptExplanation {
  title: string;
  explanation: string;
  keyPoints: string[];
  examples: string[];
  relatedConcepts: string[];
}

// ----- 2. Hint Generation -----

/** Request to generate a progressive hint */
export interface HintGenerationRequest {
  topicTitle: string;
  problemDescription: string;
  submittedCode?: string;
  hintNumber: number;
  language: string;
}

/** Response containing a single hint */
export interface HintResponse {
  hintNumber: number;
  hint: string;
  guidance: string;
  progressionLevel: number;
}

// ----- 3. Code Review -----

/** Request to review submitted code */
export interface CodeReviewRequest {
  code: string;
  language: string;
  topicTitle?: string;
}

/** Response containing code review results */
export interface CodeReviewResponse {
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    line: number;
    message: string;
    suggestion: string;
  }>;
  overallFeedback: string;
  improvementAreas: string[];
  strengths: string[];
}

// ----- 4. Code Analysis -----

/** Request to analyze code */
export interface CodeAnalysisRequest {
  code: string;
  language: string;
  topicTitle?: string;
}

/** Response containing code analysis results */
export interface SarvamCodeAnalysis {
  algorithmsUsed: string[];
  dataStructuresUsed: string[];
  optimizations: string[];
  timeComplexity: string;
  spaceComplexity: string;
  weaknesses: string[];
  suggestions: string[];
}

// ----- 5. Viva Generation -----

/** Request to generate a viva question */
export interface VivaQuestionGenerationRequest {
  topicTitle: string;
  submittedCode: string;
  language: string;
  previousQuestions?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

/** Response containing a viva question */
export interface VivaQuestionResponse {
  question: string;
  category: 'concept' | 'implementation' | 'optimization' | 'edge_cases';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedKeyPoints: string[];
}

// ----- 6. Viva Evaluation -----

/** Request to evaluate a viva answer */
export interface VivaEvaluationRequest {
  question: string;
  studentAnswer: string;
  submittedCode?: string;
  topicTitle?: string;
  language?: string;
}

/** Response containing viva answer evaluation */
export interface VivaEvaluationResponse {
  score: number;
  feedback: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  nextQuestionSuggestion?: string;
}

// ----- Additional: Translation & TTS -----

/** Request to translate content */
export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: Language;
}

/** Response from translation */
export interface TranslationResponse {
  translatedText: string;
  detectedLanguage: string;
}

/** Request for text-to-speech */
export interface TextToSpeechRequest {
  text: string;
  language: Language;
  speed?: number;
}

/** Response from text-to-speech */
export interface TextToSpeechResponse {
  audioBase64: string;
}

// ========================================================================
// GEMINI AI SERVICE CONTRACTS
// ========================================================================

// ----- 1. Project Generation -----

/** Request to generate a coding project */
export interface ProjectGenerationRequest {
  topicTitle: string;
  conceptText: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  language?: string;
}

/** Response containing a generated project spec */
export interface GeminiProjectResponse {
  title: string;
  description: string;
  starterCode: string;
  subtasks: Subtask[];
  testCases: TestCase[];
}

// ----- 2. Milestone Generation -----

/** Request to generate milestones for a project */
export interface MilestoneGenerationRequest {
  projectTitle: string;
  projectDescription: string;
  numberOfMilestones: number;
  difficulty?: string;
}

/** Response containing generated milestones */
export interface MilestoneGenerationResponse {
  milestones: Array<{
    title: string;
    description: string;
    order: number;
    isRequired: boolean;
    estimatedDays?: number;
    deliverables?: string[];
  }>;
}

// ========================================================================
// JUDGE0 SERVICE CONTRACTS
// ========================================================================

/** Request to submit code to Judge0 */
export interface Judge0SubmissionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

/** Raw response from Judge0 API */
export interface Judge0Response {
  token: string;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: number;
  memory?: number;
  status_id: number;
  status: {
    id: number;
    description: string;
  };
}

// ----- 1 & 2: Runtime & Memory Analysis -----

/** Runtime execution metrics */
export interface RuntimeAnalysis {
  executionTime: number;
  executionTimeLimit: number;
  isWithinTimeLimit: boolean;
  timePercentageUsed: number;
}

/** Memory usage metrics */
export interface MemoryAnalysis {
  memoryUsed: number;
  memoryLimit: number;
  isWithinMemoryLimit: boolean;
  memoryPercentageUsed: number;
}

// ----- 3: Test Case Results -----

/** Individual test case result */
export interface TestCaseResult {
  testCaseNumber: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  memoryUsed: number;
  errorMessage?: string;
}

// ----- 4: Combined Execution Analysis -----

/** Comprehensive execution analysis */
export interface ExecutionAnalysis {
  runtimeAnalysis: RuntimeAnalysis;
  memoryAnalysis: MemoryAnalysis;
  testCaseResults: TestCaseResult[];
  totalTestsPassed: number;
  totalTestsRun: number;
  allTestsPassed: boolean;
}
