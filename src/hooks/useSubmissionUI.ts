/**
 * src/hooks/useSubmissionUI.ts
 * Custom hook for managing submission UI state and interactions
 * Handles button states, modals, notifications, etc.
 * 
 * Coordinates between:
 * - Editor UI
 * - Submission service
 * - Submission store
 */

import { useState, useCallback } from 'react';
import { Submission } from '../types';

interface SubmissionUIState {
  isModalOpen: boolean;
  showResults: boolean;
  activeTab: 'code' | 'results' | 'viva';
}

export function useSubmissionUI() {
  const [uiState, setUIState] = useState<SubmissionUIState>({
    isModalOpen: false,
    showResults: false,
    activeTab: 'code',
  });

  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [submissionTimestamp, setSubmissionTimestamp] = useState<string | null>(null);

  /**
   * Open submission modal
   */
  const openSubmissionModal = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      isModalOpen: true,
    }));
  }, []);

  /**
   * Close submission modal
   */
  const closeSubmissionModal = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  }, []);

  /**
   * Show results panel
   */
  const showResultsPanel = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      showResults: true,
      activeTab: 'results',
    }));
  }, []);

  /**
   * Hide results panel
   */
  const hideResultsPanel = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      showResults: false,
    }));
  }, []);

  /**
   * Switch active tab
   */
  const setActiveTab = useCallback((tab: 'code' | 'results' | 'viva') => {
    setUIState((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  }, []);

  /**
   * Update last submission and timestamp
   */
  const updateLastSubmission = useCallback((submission: Submission) => {
    setLastSubmission(submission);
    setSubmissionTimestamp(submission.createdAt);
  }, []);

  /**
   * Check if code has unsaved changes
   */
  const hasUnsavedChanges = useCallback((currentCode: string, submittedCode?: string) => {
    return currentCode && (!submittedCode || currentCode !== submittedCode);
  }, []);

  return {
    // State
    isModalOpen: uiState.isModalOpen,
    showResults: uiState.showResults,
    activeTab: uiState.activeTab,
    lastSubmission,
    submissionTimestamp,

    // Actions
    openSubmissionModal,
    closeSubmissionModal,
    showResultsPanel,
    hideResultsPanel,
    setActiveTab,
    updateLastSubmission,
    hasUnsavedChanges,
  };
}
