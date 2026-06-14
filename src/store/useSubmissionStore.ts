/**
 * src/store/useSubmissionStore.ts
 * Zustand store for submission state management
 * Handles submission lifecycle: pending → processing → completed
 * 
 * Submission Flow:
 * Create → Poll → Complete → Report
 * 
 * TODO: Integrate with MongoDB Atlas for persistence
 * TODO: Implement real-time submission polling via WebSockets
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Submission, SubmissionStatus, ExecutionResult } from '../types';
import { submissionService } from '../services/submissionService';

interface SubmissionStoreState {
  // Submission state
  submissions: Map<string, Submission>;
  currentSubmissionId: string | null;
  isPolling: boolean;
  pollingError: string | null;

  // Getters
  getCurrentSubmission: () => Submission | null;
  getSubmissionById: (id: string) => Submission | null;
  getSubmissionsByTopic: (topicId: string) => Submission[];

  // State setters
  setCurrentSubmissionId: (id: string | null) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmission: (id: string, updates: Partial<Submission>) => void;
  setIsPolling: (isPolling: boolean) => void;
  setPollingError: (error: string | null) => void;

  // Actions
  pollSubmissionStatus: (submissionId: string, maxRetries?: number) => Promise<Submission>;
  clearPollingError: () => void;
  clearAllSubmissions: () => void;
}

export const useSubmissionStore = create<SubmissionStoreState>(
  devtools(
    (set, get) => ({
      submissions: new Map(),
      currentSubmissionId: null,
      isPolling: false,
      pollingError: null,

      /**
       * Get current active submission
       */
      getCurrentSubmission: () => {
        const { currentSubmissionId, submissions } = get();
        if (!currentSubmissionId) return null;
        return submissions.get(currentSubmissionId) || null;
      },

      /**
       * Get submission by ID
       */
      getSubmissionById: (id: string) => {
        const { submissions } = get();
        return submissions.get(id) || null;
      },

      /**
       * Get all submissions for a topic
       */
      getSubmissionsByTopic: (topicId: string) => {
        const { submissions } = get();
        return Array.from(submissions.values()).filter(
          (sub) => sub.topic === topicId || (typeof sub.topic === 'object' && sub.topic._id === topicId)
        );
      },

      /**
       * Set current active submission
       */
      setCurrentSubmissionId: (id: string | null) => {
        set({ currentSubmissionId: id });
      },

      /**
       * Add submission to store
       */
      addSubmission: (submission: Submission) => {
        const { submissions } = get();
        const newSubmissions = new Map(submissions);
        newSubmissions.set(submission._id, submission);
        set({ submissions: newSubmissions });
      },

      /**
       * Update submission with new data
       */
      updateSubmission: (id: string, updates: Partial<Submission>) => {
        const { submissions } = get();
        const submission = submissions.get(id);
        if (!submission) return;

        const updated = { ...submission, ...updates };
        const newSubmissions = new Map(submissions);
        newSubmissions.set(id, updated);
        set({ submissions: newSubmissions });
      },

      /**
       * Set polling state
       */
      setIsPolling: (isPolling: boolean) => {
        set({ isPolling });
      },

      /**
       * Set polling error
       */
      setPollingError: (error: string | null) => {
        set({ pollingError: error });
      },

      /**
       * Poll submission status from backend
       * Handles exponential backoff and timeout
       * 
       * TODO: Connect to /api/submissions/:id/poll endpoint
       * Flow:
       * 1. GET /api/submissions/:id/poll
       * 2. Check status (pending/processing/completed)
       * 3. If still processing, wait and retry
       * 4. Update store with final results
       * 5. Return completed submission
       */
      pollSubmissionStatus: async (submissionId: string, maxRetries: number = 30) => {
        set({ isPolling: true, pollingError: null });

        try {
          const submission = await submissionService.waitForExecutionResult(
            submissionId,
            maxRetries
          );

          // Update store with final results
          get().updateSubmission(submissionId, {
            status: submission.status,
            stdout: submission.stdout,
            stderr: submission.stderr,
            executionTime: submission.executionTime,
            memoryUsed: submission.memoryUsed,
            testsPassed: submission.testsPassed,
            testsTotal: submission.testsTotal,
            score: submission.score,
            isAccepted: submission.isAccepted,
            updatedAt: submission.updatedAt,
          });

          set({ isPolling: false });
          return submission;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Polling failed';
          set({
            pollingError: errorMessage,
            isPolling: false,
          });
          throw error;
        }
      },

      /**
       * Clear polling error
       */
      clearPollingError: () => {
        set({ pollingError: null });
      },

      /**
       * Clear all submissions from store
       */
      clearAllSubmissions: () => {
        set({
          submissions: new Map(),
          currentSubmissionId: null,
          pollingError: null,
        });
      },
    }),
    { name: 'submission-store' }
  )
);

export default useSubmissionStore;
