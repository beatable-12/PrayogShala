/**
 * src/hooks/useEditorSubmit.ts
 * Integrated hook combining editor, submission, and UI state
 * Primary hook for handling code submission from the editor
 * 
 * Submission Flow:
 * 1. Student clicks Submit
 * 2. Validate code and context
 * 3. Save to editor store
 * 4. Submit to submission service
 * 5. Add to submission store
 * 6. Start polling for results
 * 7. Update UI with results
 * 
 * TODO: Save submission to MongoDB Atlas
 */

import { useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { useSubmissionStore } from '../store/useSubmissionStore';
import { useSubmissionFlow } from './useSubmissionFlow';
import { useSubmissionUI } from './useSubmissionUI';
import { Submission, ProgrammingLanguage } from '../types';

interface UseEditorSubmitOptions {
  topicId: string;
  projectId?: string;
  onSubmissionSuccess?: (submission: Submission) => void;
  onSubmissionError?: (error: Error) => void;
}

export function useEditorSubmit(options: UseEditorSubmitOptions) {
  const { topicId, projectId, onSubmissionSuccess, onSubmissionError } = options;

  // Editor store
  const {
    code,
    language,
    setCode,
    setLanguage,
    submitCode: storeSubmitCode,
  } = useEditorStore((state) => ({
    code: state.code,
    language: state.language,
    setCode: state.setCode,
    setLanguage: state.setLanguage,
    submitCode: state.submitCode,
  }));

  // Submission store
  const { currentSubmissionId, isPolling, getCurrentSubmission } =
    useSubmissionStore((state) => ({
      currentSubmissionId: state.currentSubmissionId,
      isPolling: state.isPolling,
      getCurrentSubmission: state.getCurrentSubmission,
    }));

  // Submission flow
  const { handleSubmit, handlePollStatus, isLoading, error: submissionError } =
    useSubmissionFlow({
      topicId,
      projectId,
      onSuccess: onSubmissionSuccess,
      onError: onSubmissionError,
      autoStartPolling: true,
    });

  // UI state
  const { openSubmissionModal, showResultsPanel, updateLastSubmission } =
    useSubmissionUI();

  /**
   * Main submission handler
   * Orchestrates the entire submission flow
   * 
   * TODO: Connect to MongoDB
   * POST /api/submissions
   * {
   *   sourceCode: string (code)
   *   language: ProgrammingLanguage
   *   topicId: string
   *   projectId?: string
   *   timestamp: ISO string
   * }
   */
  const submitCode = useCallback(async () => {
    try {
      // Validate code before submission
      if (!code || code.trim().length === 0) {
        throw new Error('Please write your solution before submitting.');
      }

      // TODO: Validate code length (e.g., max 50KB)
      if (code.length > 50000) {
        throw new Error('Code exceeds maximum length of 50KB.');
      }

      // Submit and get submission record
      const submission = await handleSubmit();

      // Update UI
      updateLastSubmission(submission);
      showResultsPanel();
      openSubmissionModal();

      return submission;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Submission failed';
      console.error('Submission error:', errorMessage);
      throw error;
    }
  }, [code, handleSubmit, updateLastSubmission, showResultsPanel, openSubmissionModal]);

  /**
   * Change language and update editor
   */
  const changeLanguage = useCallback(
    (newLanguage: ProgrammingLanguage) => {
      setLanguage(newLanguage);
      // TODO: Load appropriate code template or draft for new language
    },
    [setLanguage]
  );

  /**
   * Update code in editor and store
   */
  const updateCode = useCallback(
    (newCode: string) => {
      setCode(newCode);
      // TODO: Trigger auto-save via useAutoSave hook
    },
    [setCode]
  );

  /**
   * Resubmit last submission
   * Used for retrying failed submissions
   */
  const resubmitCode = useCallback(async () => {
    if (!code || code.trim().length === 0) {
      throw new Error('Code is empty. Cannot resubmit.');
    }

    try {
      const submission = await handleSubmit();
      updateLastSubmission(submission);
      return submission;
    } catch (error) {
      console.error('Resubmission failed:', error);
      throw error;
    }
  }, [code, handleSubmit, updateLastSubmission]);

  /**
   * Get current submission from store
   */
  const getCurrentSubmissionFromStore = useCallback(() => {
    return getCurrentSubmission();
  }, [getCurrentSubmission]);

  return {
    // State
    code,
    language,
    topicId,
    projectId,
    currentSubmissionId,
    isLoading,
    isPolling,
    submissionError,

    // Actions
    submitCode,
    resubmitCode,
    changeLanguage,
    updateCode,
    pollStatus: handlePollStatus,

    // Getters
    getCurrentSubmission: getCurrentSubmissionFromStore,
  };
}
