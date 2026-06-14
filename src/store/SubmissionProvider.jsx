/**
 * src/store/SubmissionProvider.jsx
 * React Context Provider for global submission state
 * Wrap your app with this to provide submission context throughout
 * 
 * Usage:
 * import { SubmissionProvider } from './store/SubmissionProvider';
 * 
 * <SubmissionProvider>
 *   <YourApp />
 * </SubmissionProvider>
 * 
 * In components:
 * const { currentSubmission, isPolling } = useSubmission();
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useSubmissionStore } from './useSubmissionStore';

const SubmissionContext = createContext();

/**
 * Provider component
 * Exposes submission store state and helpers
 */
export function SubmissionProvider({ children }) {
  // Get state from store
  const store = useSubmissionStore((state) => ({
    currentSubmissionId: state.currentSubmissionId,
    isPolling: state.isPolling,
    pollingError: state.pollingError,
    pollSubmissionStatus: state.pollSubmissionStatus,
    clearPollingError: state.clearPollingError,
    clearAllSubmissions: state.clearAllSubmissions,
    getCurrentSubmission: state.getCurrentSubmission,
    getSubmissionById: state.getSubmissionById,
    getSubmissionsByTopic: state.getSubmissionsByTopic,
  }));

  const submissions = useSubmissionStore((state) =>
    Array.from(state.submissions.values())
  );

  const currentSubmission = store.getCurrentSubmission();

  // Compute derived state
  const canStartViva = useMemo(() => {
    return currentSubmission?.isAccepted === true && !store.isPolling;
  }, [currentSubmission, store.isPolling]);

  const canResubmit = useMemo(() => {
    return currentSubmission && !store.isPolling && !currentSubmission.isAccepted;
  }, [currentSubmission, store.isPolling]);

  const value = {
    // Submission data
    currentSubmission,
    currentSubmissionId: store.currentSubmissionId,
    submissionHistory: submissions,

    // States
    isPolling: store.isPolling,
    pollingError: store.pollingError,

    // Actions
    pollStatus: store.pollSubmissionStatus,
    clearPollingError: store.clearPollingError,
    clearAllSubmissions: store.clearAllSubmissions,

    // Helper methods
    getSubmissionById: store.getSubmissionById,
    getSubmissionsByTopic: store.getSubmissionsByTopic,

    // Computed state
    canStartViva,
    canResubmit,
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}

/**
 * Hook to use submission context
 * Must be used within SubmissionProvider
 */
export function useSubmission() {
  const context = useContext(SubmissionContext);
  if (!context) {
    throw new Error(
      'useSubmission must be used within <SubmissionProvider>'
    );
  }
  return context;
}

/**
 * Hook to get current submission
 */
export function useCurrentSubmission() {
  const { currentSubmission } = useSubmission();
  return currentSubmission;
}

/**
 * Hook to check if viva can start
 */
export function useCanStartViva() {
  const { canStartViva } = useSubmission();
  return canStartViva;
}

/**
 * Hook to check if resubmission is allowed
 */
export function useCanResubmit() {
  const { canResubmit } = useSubmission();
  return canResubmit;
}

/**
 * Hook to get submission history for topic
 */
export function useTopicSubmissions(topicId) {
  const { getSubmissionsByTopic } = useSubmission();
  return useMemo(
    () => getSubmissionsByTopic(topicId),
    [topicId, getSubmissionsByTopic]
  );
}
