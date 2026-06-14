/**
 * src/types/submission.ts
 * Code submission and execution-related TypeScript interfaces
 * 
 * Backend Integration Notes:
 * - Uses Judge0 API for code execution (judge0Token tracks execution jobs)
 * - Submissions are evaluated against test cases from Topic.projectTemplate
 * - Execution results drive SkillReport scoring
 * - Backend processes submissions asynchronously via Bull queue
 */

import { Topic } from './module';
import { User } from './user';

export type ProgrammingLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c';

export type SubmissionStatus = 
  | 'pending' 
  | 'processing' 
  | 'accepted' 
  | 'wrong_answer' 
  | 'time_limit_exceeded' 
  | 'compilation_error' 
  | 'runtime_error' 
  | 'failed';

/**
 * Submission represents a code submission by a user for a topic
 * Backend Endpoint: POST /api/submissions, GET /api/submissions/:id
 * Judge0 Integration: judge0Token references execution job in Judge0
 */
export interface Submission {
  _id: string;
  user: string | User;
  topic: string | Topic;
  code: string;
  language: ProgrammingLanguage;
  judge0Token: string | null;
  status: SubmissionStatus;
  stdout: string;
  stderr: string;
  executionTime: number;
  memoryUsed: number;
  testsPassed: number;
  testsTotal: number;
  score: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ExecutionResult from Judge0 code execution
 * Backend: Returned by Judge0 API and stored in Submission
 */
export interface ExecutionResult {
  token: string;
  statusId: number;
  status: SubmissionStatus;
  statusDescription: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  executionTime: number;
  memoryUsed: number;
}

/**
 * Request payload for submitting code
 * Backend Endpoint: POST /api/submissions/submit
 */
export interface SubmitCodePayload {
  topicId: string;
  code: string;
  language: ProgrammingLanguage;
  stdin?: string;
}

// ============= Judge0 Analysis Types =============

/**
 * Runtime execution metrics from Judge0
 * Tracks execution time vs. configured limits
 */
export interface RuntimeAnalysis {
  executionTime: number;
  executionTimeLimit: number;
  isWithinTimeLimit: boolean;
  timePercentageUsed: number;
}

/**
 * Memory usage metrics from Judge0
 * Tracks memory consumption vs. configured limits
 */
export interface MemoryAnalysis {
  memoryUsed: number;
  memoryLimit: number;
  isWithinMemoryLimit: boolean;
  memoryPercentageUsed: number;
}

/**
 * Individual test case execution result
 * Backend: Generated for each test case run
 */
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

/**
 * Comprehensive execution analysis combining runtime, memory, and test results
 * Backend Endpoint: GET /api/submissions/:id/analysis
 */
export interface ExecutionAnalysis {
  runtimeAnalysis: RuntimeAnalysis;
  memoryAnalysis: MemoryAnalysis;
  testCaseResults: TestCaseResult[];
  totalTestsPassed: number;
  totalTestsRun: number;
  allTestsPassed: boolean;
}
