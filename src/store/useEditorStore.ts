/**
 * src/store/useEditorStore.ts
 * Zustand store for code editor state
 * Manages code, language, theme, execution results, and submission context
 * 
 * Submission Flow:
 * Student Code → useEditorStore → submissionService → MongoDB Atlas
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EditorStore, ProgrammingLanguage, ExecutionResult, Submission } from '../types';
import { API_CONFIG } from '../config';
import { submissionService } from '../services/submissionService';

interface EditorContextState {
  topicId: string | null;
  projectId: string | null;
  currentSubmission: Submission | null;
  submissionHistory: Submission[];
  isSubmitting: boolean;
  submissionError: string | null;
}

interface ExtendedEditorStore extends EditorStore {
  // Submission context
  topicId: string | null;
  projectId: string | null;
  currentSubmission: Submission | null;
  submissionHistory: Submission[];
  isSubmitting: boolean;
  submissionError: string | null;

  // Context setters
  setTopicId: (topicId: string | null) => void;
  setProjectId: (projectId: string | null) => void;
  setCurrentSubmission: (submission: Submission | null) => void;
  setSubmissionError: (error: string | null) => void;
  
  // Submission actions
  submitCode: (code: string, language: ProgrammingLanguage, topicId: string, projectId?: string) => Promise<Submission>;
  clearSubmissionError: () => void;
}

export const useEditorStore = create<ExtendedEditorStore>(
  devtools(
    (set, get) => ({
      // Editor state
      code: '',
      language: 'python' as ProgrammingLanguage,
      isDarkTheme: true,
      isExecuting: false,
      executionResult: null,
      output: '',
      errors: '',

      // Submission context state
      topicId: null,
      projectId: null,
      currentSubmission: null,
      submissionHistory: [],
      isSubmitting: false,
      submissionError: null,

      /**
       * Set code in editor
       */
      setCode: (code: string) => {
        set({ code });
      },

      /**
       * Set programming language
       */
      setLanguage: (language: ProgrammingLanguage) => {
        set({ language });
      },

      /**
       * Toggle dark/light theme
       */
      setIsDarkTheme: (isDark: boolean) => {
        set({ isDarkTheme: isDark });
      },

      /**
       * Set execution state
       */
      setIsExecuting: (executing: boolean) => {
        set({ isExecuting: executing });
      },

      /**
       * Set execution result from Judge0
       */
      setExecutionResult: (result: ExecutionResult | null) => {
        set({ executionResult: result });
      },

      /**
       * Set stdout output
       */
      setOutput: (output: string) => {
        set({ output });
      },

      /**
       * Set stderr errors
       */
      setErrors: (errors: string) => {
        set({ errors });
      },

      /**
       * Set current topic context for submission
       */
      setTopicId: (topicId: string | null) => {
        set({ topicId });
      },

      /**
       * Set current project context for submission
       */
      setProjectId: (projectId: string | null) => {
        set({ projectId });
      },

      /**
       * Set current submission record
       */
      setCurrentSubmission: (submission: Submission | null) => {
        set({ currentSubmission: submission });
      },

      /**
       * Set submission error
       */
      setSubmissionError: (error: string | null) => {
        set({ submissionError: error });
      },

      /**
       * Submit code - handles full submission flow
       * Flow: Code → Validation → Service → MongoDB (future)
       * 
       * TODO: Save submission to MongoDB Atlas
       * - POST /api/submissions with code, language, topicId, projectId, timestamp
       * - Handle asynchronous Judge0 execution
       * - Poll execution status
       * - Update submission with results
       */
      submitCode: async (
        code: string,
        language: ProgrammingLanguage,
        topicId: string,
        projectId?: string
      ): Promise<Submission> => {
        set({ isSubmitting: true, submissionError: null });

        try {
          // Validate code and context
          if (!code || code.trim().length === 0) {
            throw new Error('Code cannot be empty');
          }

          if (!topicId) {
            throw new Error('Topic context required for submission');
          }

          const currentState = get();
          const submissionPayload = {
            topicId,
            code,
            language,
            stdin: '', // TODO: Add optional stdin input
          };

          // TODO: Call submissionService.submitCode
          // This will eventually:
          // 1. Send code to backend
          // 2. Backend submits to Judge0
          // 3. Backend stores submission in MongoDB
          // 4. Return submission record with initial status 'pending'

          const submission = await submissionService.submitCode(submissionPayload);

          // Update store with new submission
          set({
            currentSubmission: submission,
            submissionHistory: [submission, ...currentState.submissionHistory],
            isSubmitting: false,
          });

          return submission;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Submission failed';
          set({
            submissionError: errorMessage,
            isSubmitting: false,
          });
          throw error;
        }
      },

      /**
       * Clear submission error
       */
      clearSubmissionError: () => {
        set({ submissionError: null });
      },
    }),
    { name: 'editor-store' }
  )
);

/**
 * Auto-save code to localStorage periodically
 * In production, this would submit to MongoDB via submission service
 * 
 * TODO: Replace localStorage with MongoDB submission drafts
 */
export const enableAutoSave = (topicId: string, interval: number = 10000) => {
  const saveInterval = setInterval(() => {
    const { code, language, projectId } = useEditorStore.getState();
    if (code) {
      const snapshotKey = `code_${topicId}_${language}`;
      localStorage.setItem(snapshotKey, code);
      localStorage.setItem(
        `code_${topicId}_${language}_timestamp`,
        new Date().toISOString()
      );
      
      // TODO: Periodically sync with backend
      // submitCode with isDraft flag, or use separate API endpoint
      // POST /api/submissions/draft
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(saveInterval);
};

/**
 * Load code from localStorage on mount
 * 
 * TODO: Load from MongoDB submissions instead
 */
export const loadCodeSnapshot = (topicId: string, language: ProgrammingLanguage): string => {
  const snapshotKey = `code_${topicId}_${language}`;
  return localStorage.getItem(snapshotKey) || '';
};

export default useEditorStore;

