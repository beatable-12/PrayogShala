/**
 * src/services/submissionService.ts
 * Service for code submission, Judge0 execution, and result polling
 * Handles all code execution and storage in MongoDB
 * 
 * TODO: Connect MongoDB Atlas for submission persistence
 * TODO: Connect Judge0 API for code execution
 * TODO: Implement polling with exponential backoff
 * TODO: Add timeout handling and error recovery
 * TODO: Implement test case result aggregation
 * 
 * Backend Integration:
 * - POST /api/submissions - submit code for execution
 * - GET /api/submissions - list user's submissions
 * - GET /api/submissions/:id - get single submission
 * - GET /api/submissions/:id/poll - poll execution status
 * - GET /api/submissions/:id/latest - get latest submission for topic
 * - GET /api/submissions/:id/best - get best submission for topic
 */

import apiClient from './apiClient';
import { API_CONFIG } from '../config';
import {
  Submission,
  SubmitCodePayload,
  ExecutionResult,
  ProgrammingLanguage,
  PaginatedResponse,
} from '../types';

class SubmissionService {
  /**
   * Submit code to Judge0 and store in MongoDB
   * Backend Endpoint: POST /api/submissions
   * 
   * Flow:
   * 1. Send code + language + stdin to backend
   * 2. Backend submits to Judge0, gets token
   * 3. Backend stores submission record in MongoDB
   * 4. Backend polls Judge0 for result
   * 5. Backend stores result in MongoDB
   * 6. Return submission record to frontend
   */
  async submitCode(payload: SubmitCodePayload): Promise<Submission> {
    try {
      // TODO: Validate payload schema before sending
      // TODO: Check code length limits
      // TODO: Validate language is supported
      
      const submission = await apiClient.post<Submission>(
        API_CONFIG.ENDPOINTS.SUBMISSIONS_CREATE,
        {
          topicId: payload.topicId,
          code: payload.code,
          language: payload.language,
          stdin: payload.stdin || '',
        }
      );
      return submission;
    } catch (error) {
      console.error('Failed to submit code:', error);
      throw error;
    }
  }

  /**
   * Get list of user's submissions with pagination
   * Backend Endpoint: GET /api/submissions?page=1&limit=10&topicId=abc
   */
  async getSubmissions(
    topicId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Submission>> {
    try {
      // TODO: Add filtering by status (accepted, wrong_answer, etc.)
      // TODO: Add sorting options (by date, score)
      
      const response = await apiClient.get<any>(
        API_CONFIG.ENDPOINTS.SUBMISSIONS_LIST,
        {
          ...(topicId && { topicId }),
          page,
          limit,
        }
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      throw error;
    }
  }

  /**
   * Get single submission by ID
   * Backend Endpoint: GET /api/submissions/:id
   */
  async getSubmissionById(submissionId: string): Promise<Submission> {
    try {
      // TODO: Include test case results in response
      
      const submission = await apiClient.get<Submission>(
        API_CONFIG.ENDPOINTS.SUBMISSIONS_GET.replace(':id', submissionId)
      );
      return submission;
    } catch (error) {
      console.error(`Failed to fetch submission ${submissionId}:`, error);
      throw error;
    }
  }

  /**
   * Poll submission result from backend
   * Backend Endpoint: GET /api/submissions/:id/poll
   * Backend handles Judge0 polling and caches result in MongoDB
   */
  async pollSubmissionResult(submissionId: string): Promise<Submission> {
    try {
      // TODO: Backend should poll Judge0 until completion
      // TODO: Implement timeout after max retries
      
      const submission = await apiClient.get<Submission>(
        API_CONFIG.ENDPOINTS.SUBMISSIONS_POLL.replace(':id', submissionId)
      );
      return submission;
    } catch (error) {
      console.error(`Failed to poll submission ${submissionId}:`, error);
      throw error;
    }
  }

  /**
   * Poll with retries and exponential backoff
   * Returns when submission reaches final state or timeout
   */
  async waitForExecutionResult(
    submissionId: string,
    maxRetries: number = 30,
    initialDelayMs: number = 1000,
    maxDelayMs: number = 5000
  ): Promise<Submission> {
    let delay = initialDelayMs;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const submission = await this.pollSubmissionResult(submissionId);

        // Check if execution is complete
        if (
          submission.status !== 'pending' &&
          submission.status !== 'processing'
        ) {
          return submission;
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, maxDelayMs);
        retries++;
      } catch (error) {
        // Network error, retry with backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, maxDelayMs);
        retries++;
      }
    }

    throw new Error(
      `Execution timeout after ${maxRetries} retries. Submission: ${submissionId}`
    );
  }

  /**
   * Save code snapshot to localStorage as backup
   * In production, this would always be in MongoDB
   */
  saveCodeSnapshot(topicId: string, code: string, language: ProgrammingLanguage): void {
    // TODO: Consider disabling localStorage usage in production
    const snapshotKey = `code_${topicId}_${language}`;
    localStorage.setItem(snapshotKey, code);
  }

  /**
   * Load code snapshot from localStorage
   */
  loadCodeSnapshot(topicId: string, language: ProgrammingLanguage): string | null {
    const snapshotKey = `code_${topicId}_${language}`;
    return localStorage.getItem(snapshotKey);
  }

  /**
   * Clear code snapshot
   */
  clearCodeSnapshot(topicId: string, language: ProgrammingLanguage): void {
    const snapshotKey = `code_${topicId}_${language}`;
    localStorage.removeItem(snapshotKey);
  }

  /**
   * Get latest submission for a topic
   * Backend Endpoint: GET /api/submissions/topic/:topicId/latest
   */
  async getLatestSubmission(topicId: string): Promise<Submission | null> {
    try {
      // TODO: Connect to backend endpoint
      
      const submission = await apiClient.get<Submission | null>(
        `/api/submissions/topic/${topicId}/latest`
      );
      return submission;
    } catch (error) {
      console.error(`Failed to fetch latest submission for topic ${topicId}:`, error);
      return null;
    }
  }

  /**
   * Get best submission for a topic (highest score)
   * Backend Endpoint: GET /api/submissions/topic/:topicId/best
   */
  async getBestSubmission(topicId: string): Promise<Submission | null> {
    try {
      // TODO: Connect to backend endpoint
      
      const submission = await apiClient.get<Submission | null>(
        `/api/submissions/topic/${topicId}/best`
      );
      return submission;
    } catch (error) {
      console.error(`Failed to fetch best submission for topic ${topicId}:`, error);
      return null;
    }
  }

  /**
   * Get submissions by status
   * Backend Endpoint: GET /api/submissions?status=accepted
   */
  async getSubmissionsByStatus(status: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Submission>> {
    try {
      // TODO: Validate status parameter
      
      const response = await apiClient.get<any>(
        API_CONFIG.ENDPOINTS.SUBMISSIONS_LIST,
        { status, page, limit }
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch submissions with status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Save code draft to server
   * Backend Endpoint: POST /api/submissions/draft
   * Saves work-in-progress code without executing
   * 
   * TODO: Connect to MongoDB drafts collection
   * Stores:
   * - sourceCode
   * - language
   * - topicId
   * - projectId
   * - timestamp
   * - isDraft: true
   * 
   * Used for auto-save functionality
   */
  async saveDraft(
    topicId: string,
    code: string,
    language: ProgrammingLanguage,
    projectId?: string
  ): Promise<{ draftId: string; savedAt: string }> {
    try {
      // TODO: Validate code length
      // TODO: Check rate limiting for frequent saves
      
      const response = await apiClient.post<{ draftId: string; savedAt: string }>(
        '/api/submissions/draft',
        {
          topicId,
          code,
          language,
          projectId,
          timestamp: new Date().toISOString(),
        }
      );

      console.log('TODO: Save draft to MongoDB Atlas');
      return response;
    } catch (error) {
      console.error('Failed to save draft:', error);
      // Don't throw - drafts are non-critical
      return {
        draftId: `draft-${Date.now()}`,
        savedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Load draft code from server
   * Backend Endpoint: GET /api/submissions/draft/:topicId
   * Retrieves last saved draft for topic
   * 
   * TODO: Connect to MongoDB drafts collection
   * Returns:
   * - code: string
   * - language: ProgrammingLanguage
   * - savedAt: ISO timestamp
   */
  async loadDraft(topicId: string): Promise<{
    code: string;
    language: ProgrammingLanguage;
    savedAt: string;
  } | null> {
    try {
      // TODO: Connect to backend draft endpoint
      
      const draft = await apiClient.get<{
        code: string;
        language: ProgrammingLanguage;
        savedAt: string;
      } | null>(`/api/submissions/draft/${topicId}`);

      return draft;
    } catch (error) {
      console.error(`Failed to load draft for topic ${topicId}:`, error);
      return null;
    }
  }

  /**
   * Create submission from draft
   * Backend Endpoint: POST /api/submissions/from-draft/:draftId
   * Converts draft to actual submission for execution
   * 
   * TODO: Connect to MongoDB
   * - Mark draft as submitted
   * - Create new submission record
   * - Start Judge0 execution
   */
  async submitFromDraft(draftId: string, topicId: string): Promise<Submission> {
    try {
      // TODO: Validate draft exists and belongs to user
      
      const submission = await apiClient.post<Submission>(
        `/api/submissions/from-draft/${draftId}`,
        { topicId }
      );

      console.log('TODO: Create submission from draft in MongoDB');
      return submission;
    } catch (error) {
      console.error(`Failed to submit from draft ${draftId}:`, error);
      throw error;
    }
  }

  /**
   * Get submission stats for topic
   * Backend Endpoint: GET /api/submissions/topic/:topicId/stats
   * Returns submission statistics and best submission info
   * 
   * TODO: Connect to MongoDB aggregation pipeline
   * Returns:
   * - totalSubmissions: number
   * - acceptedSubmissions: number
   * - bestScore: number
   * - lastSubmissionAt: ISO timestamp
   */
  async getSubmissionStats(topicId: string): Promise<{
    totalSubmissions: number;
    acceptedSubmissions: number;
    bestScore: number;
    lastSubmissionAt: string | null;
  }> {
    try {
      // TODO: Connect to backend stats endpoint
      
      const stats = await apiClient.get<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        bestScore: number;
        lastSubmissionAt: string | null;
      }>(`/api/submissions/topic/${topicId}/stats`);

      return stats;
    } catch (error) {
      console.error(`Failed to fetch stats for topic ${topicId}:`, error);
      return {
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        bestScore: 0,
        lastSubmissionAt: null,
      };
    }
  }
}

export const submissionService = new SubmissionService();
export default submissionService;
