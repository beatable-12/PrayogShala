/**
 * src/hooks/useSubmissionFlow.ts
 * Custom hook for handling the complete submission flow
 * 
 * Submission Flow:
 * 1. Student writes code in editor
 * 2. Click submit button
 * 3. Validate code
 * 4. Submit to service (createSubmission)
 * 5. Poll for execution results
 * 6. Handle completion (navigate to viva or results)
 * 
 * TODO: Save submission to MongoDB Atlas
 * TODO: Implement WebSocket-based real-time polling
 */

import { useCallback, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { useSubmissionStore } from '../store/useSubmissionStore';
import { submissionService } from '../services/submissionService';
import { Submission, SubmitCodePayload } from '../types';

interface UseSubmissionFlowOptions {
  topicId: string;
  projectId?: string;
  onSuccess?: (submission: Submission) => void;
  onError?: (error: Error) => void;
  autoStartPolling?: boolean;
}

export function useSubmissionFlow(options: UseSubmissionFlowOptions) {
  const {
    topicId,
    projectId,
    onSuccess,
    onError,
    autoStartPolling = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editor store
  const { code, language } = useEditorStore((state) => ({
    code: state.code,
    language: state.language,
  }));

  // Submission store
  const { addSubmission, setCurrentSubmissionId, pollSubmissionStatus } =
    useSubmissionStore((state) => ({
      addSubmission: state.addSubmission,
      setCurrentSubmissionId: state.setCurrentSubmissionId,
      pollSubmissionStatus: state.pollSubmissionStatus,
    }));

  /**
   * Submit code for execution
   * 
   * Flow:
   * 1. Validate inputs (code, topicId)
   * 2. Create SubmitCodePayload
   * 3. Call submissionService.submitCode
   * 4. Add to submission store
   * 5. Start polling if autoStartPolling is true
   * 
   * TODO: Connect to MongoDB submission endpoint
   * POST /api/submissions
   * - Store sourceCode, language, topicId, projectId, timestamp
   * - Judge0 will handle execution asynchronously
   */
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate code
      if (!code || code.trim().length === 0) {
        throw new Error('Code cannot be empty. Please write your solution.');
      }

      // Validate topic context
      if (!topicId) {
        throw new Error('Topic context is required for submission.');
      }

      const payload: SubmitCodePayload = {
        topicId,
        code,
        language,
        stdin: '',
      };

      // TODO: Call submissionService.submitCode
      // This will:
      // 1. Send code to backend
      // 2. Backend stores in MongoDB
      // 3. Backend submits to Judge0
      // 4. Backend returns submission record with status 'pending'
      const submission = await submissionService.submitCode(payload);

      // Add to store
      addSubmission(submission);
      setCurrentSubmissionId(submission._id);

      // Start polling if auto polling enabled
      if (autoStartPolling) {
        handlePollStatus(submission._id);
      }

      // Call success callback
      onSuccess?.(submission);
      setIsLoading(false);

      return submission;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Submission failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
      throw err;
    }
  }, [code, language, topicId, addSubmission, setCurrentSubmissionId, onSuccess, onError, autoStartPolling]);

  /**
   * Poll submission status
   * 
   * Polls until submission reaches final state
   * Updates store with results
   * 
   * TODO: Connect to MongoDB poll endpoint
   * GET /api/submissions/:id/poll
   * - Backend polls Judge0 for status
   * - Backend updates MongoDB with results
   * - Returns submission with final status and execution details
   */
  const handlePollStatus = useCallback(
    async (submissionId: string) => {
      try {
        const submission = await pollSubmissionStatus(submissionId);
        return submission;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Polling failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        throw err;
      }
    },
    [pollSubmissionStatus, onError]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleSubmit,
    handlePollStatus,
    clearError,
    isLoading,
    error,
  };
}
