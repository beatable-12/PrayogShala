/**
 * src/utils/monacoEditorArchitecture.ts
 * Complete Monaco Editor Architecture Documentation
 * 
 * This file documents the complete submission flow for Monaco Editor
 * All components, stores, and services working together
 */

/**
 * SUBMISSION FLOW ARCHITECTURE
 * ============================
 * 
 * Student Code → Stores → Service → API (Future: MongoDB)
 * 
 * Components & Files Created:
 * ==========================
 */

export const MONACO_EDITOR_ARCHITECTURE = {
  // STORES (State Management)
  stores: {
    useEditorStore: {
      file: 'src/store/useEditorStore.ts (ENHANCED)',
      purpose: 'Manages editor code and submission context',
      state: {
        code: 'string - student code',
        language: 'ProgrammingLanguage - python/javascript/java/cpp/c',
        isDarkTheme: 'boolean',
        isExecuting: 'boolean',
        executionResult: 'ExecutionResult | null',
        output: 'string',
        errors: 'string',
        topicId: 'string | null - SUBMISSION CONTEXT',
        projectId: 'string | null - SUBMISSION CONTEXT',
        currentSubmission: 'Submission | null',
        submissionHistory: 'Submission[]',
        isSubmitting: 'boolean',
        submissionError: 'string | null',
      },
      methods: [
        'setCode(code)',
        'setLanguage(language)',
        'setIsDarkTheme(isDark)',
        'setIsExecuting(executing)',
        'setExecutionResult(result)',
        'setOutput(output)',
        'setErrors(errors)',
        'setTopicId(topicId)',
        'setProjectId(projectId)',
        'setCurrentSubmission(submission)',
        'setSubmissionError(error)',
        'submitCode(code, language, topicId, projectId?) - MAIN SUBMISSION',
        'clearSubmissionError()',
      ],
    },

    useSubmissionStore: {
      file: 'src/store/useSubmissionStore.ts (NEW)',
      purpose: 'Tracks submission lifecycle and polling',
      state: {
        submissions: 'Map<string, Submission>',
        currentSubmissionId: 'string | null',
        isPolling: 'boolean',
        pollingError: 'string | null',
      },
      methods: [
        'getCurrentSubmission() - get active submission',
        'getSubmissionById(id)',
        'getSubmissionsByTopic(topicId)',
        'setCurrentSubmissionId(id)',
        'addSubmission(submission)',
        'updateSubmission(id, updates)',
        'setIsPolling(isPolling)',
        'setPollingError(error)',
        'pollSubmissionStatus(submissionId, maxRetries) - POLLING LOGIC',
        'clearPollingError()',
        'clearAllSubmissions()',
      ],
    },
  },

  // CUSTOM HOOKS (Business Logic)
  hooks: {
    useEditorSubmit: {
      file: 'src/hooks/useEditorSubmit.ts (NEW)',
      purpose: 'Orchestrates complete submission flow',
      usage: `
        const {
          code,
          language,
          isLoading,
          submissionError,
          submitCode,
          resubmitCode,
          pollStatus,
          getCurrentSubmission,
        } = useEditorSubmit({
          topicId: 'topic-123',
          projectId: 'project-456',
          onSubmissionSuccess: (submission) => {},
          onSubmissionError: (error) => {},
        });
      `,
      key_actions: [
        'submitCode() - Main action to submit code',
        'resubmitCode() - Retry submission',
        'changeLanguage(lang)',
        'updateCode(newCode)',
        'pollStatus() - Poll for results',
      ],
    },

    useSubmissionFlow: {
      file: 'src/hooks/useSubmissionFlow.ts (NEW)',
      purpose: 'Handles submission and polling flow',
      handles: [
        'Code validation',
        'API submission',
        'Auto-polling with exponential backoff',
        'Error handling and callbacks',
      ],
    },

    useSubmissionUI: {
      file: 'src/hooks/useSubmissionUI.ts (NEW)',
      purpose: 'UI state management for submission',
      manages: [
        'Modal open/close',
        'Results panel visibility',
        'Active tab (code/results/viva)',
        'Last submission tracking',
      ],
    },
  },

  // SERVICES (API Integration)
  services: {
    submissionService: {
      file: 'src/services/submissionService.ts (ENHANCED)',
      endpoints: [
        'POST /api/submissions - submit code',
        'GET /api/submissions - list submissions',
        'GET /api/submissions/:id - get one',
        'GET /api/submissions/:id/poll - poll status',
        'POST /api/submissions/draft - save draft',
        'GET /api/submissions/draft/:topicId - load draft',
        'POST /api/submissions/from-draft/:draftId - submit from draft',
        'GET /api/submissions/topic/:topicId/stats - get stats',
      ],
      methods: [
        'submitCode(payload) - PRIMARY SUBMISSION',
        'getSubmissions(topicId?, page, limit)',
        'getSubmissionById(id)',
        'pollSubmissionResult(id)',
        'waitForExecutionResult(id) - WITH BACKOFF',
        'saveDraft(topicId, code, language, projectId)',
        'loadDraft(topicId)',
        'submitFromDraft(draftId, topicId)',
        'getSubmissionStats(topicId)',
      ],
    },
  },

  // COMPONENTS (UI)
  components: {
    SubmissionResultsPanel: {
      file: 'src/components/SubmissionResultsPanel.jsx (NEW)',
      displays: [
        'Status (accepted/wrong_answer/error)',
        'Test results (passed/total)',
        'Execution stats (time/memory)',
        'Output and errors',
        'Score',
        'Action buttons (Start Viva if accepted)',
      ],
    },

    SubmissionModal: {
      file: 'src/components/SubmissionModal.jsx (NEW)',
      purpose: 'Modal container for submission results',
      features: [
        'Fullscreen-like modal',
        'Dark/light theme support',
        'Close button',
        'Children composition',
      ],
    },
  },

  // UTILITIES
  utilities: {
    submissionValidation: {
      file: 'src/utils/submissionValidation.ts (NEW)',
      exports: [
        'validateSubmission(payload) - validate before submit',
        'validateCodeSyntax(code, language) - syntax check',
        'hasCodeChanged(current, last) - check changes',
        'estimateCodeComplexity(code)',
        'getLanguageExtension(language)',
        'getLanguageDisplayName(language)',
        'validateSubmissionResult(submission)',
        'estimateExecutionTime(language)',
      ],
    },

    submissionFlowIntegration: {
      file: 'src/utils/submissionFlowIntegration.ts (NEW)',
      contains: [
        'SUBMISSION_FLOW_ARCHITECTURE - flow documentation',
        'SUBMISSION_MONGODB_SCHEMA - MongoDB schema reference',
        'EDITOR_STORE_STATE_FLOW - state transitions',
        'TODO_IMPLEMENTATION_CHECKLIST - implementation guide',
      ],
    },
  },

  // CONTEXT PROVIDER
  context: {
    SubmissionProvider: {
      file: 'src/store/SubmissionProvider.jsx (NEW)',
      purpose: 'Global submission context for nested components',
      provides: [
        'useSubmission() - full context',
        'useCurrentSubmission() - current submission only',
        'useCanStartViva() - check viva eligibility',
        'useCanResubmit() - check resubmit eligibility',
        'useTopicSubmissions(topicId) - submissions for topic',
      ],
    },
  },
};

/**
 * COMPLETE SUBMISSION FLOW
 * =======================
 */
export const COMPLETE_SUBMISSION_FLOW = {
  step1_initialization: {
    description: 'User navigates to code editor',
    components_involved: ['CodeWorkspacePage', 'MonacoEditorPanel'],
    state_changes: [
      'useEditorStore initializes with empty code',
      'Editor UI renders with language selector',
    ],
  },

  step2_code_editing: {
    description: 'Student writes code in Monaco Editor',
    triggers: [
      'onChange event from MonacoEditorPanel',
      'setCode() updates editor store',
      'enableAutoSave() saves to localStorage every 10s',
      // TODO: 'POST /api/submissions/draft to MongoDB',
    ],
  },

  step3_submission: {
    description: 'Student clicks Submit button',
    flow: [
      '1. Click Submit on WorkspaceToolbar',
      '2. Calls useEditorSubmit.submitCode()',
      '3. Validate code (empty check, length check)',
      '4. Call submissionService.submitCode(payload)',
    ],
  },

  step4_service_call: {
    description: 'submissionService sends to backend API',
    backend_receives: {
      topicId: 'string (which topic)',
      code: 'string (student code)',
      language: 'ProgrammingLanguage (python/js/java/cpp/c)',
      stdin: 'string (optional input)',
      // TODO: MongoDB storage:
      // projectId?: string
      // timestamp: ISO string
      // userId: from JWT
    },
  },

  step5_backend_processing: {
    description: 'Backend (TODO: implement)',
    operations: [
      '1. Store Submission document in MongoDB',
      '   - sourceCode: code',
      '   - language: language',
      '   - topicId: topicId',
      '   - projectId: projectId',
      '   - timestamp: Date.now()',
      '   - status: "pending"',
      '',
      '2. Submit code to Judge0 API',
      '   - Get execution token',
      '   - Store token in MongoDB',
      '',
      '3. Return Submission record to frontend',
    ],
  },

  step6_store_submission: {
    description: 'Store submission in client state',
    actions: [
      'useSubmissionStore.addSubmission(submission)',
      'useSubmissionStore.setCurrentSubmissionId(id)',
      'useEditorStore.setCurrentSubmission(submission)',
      'useEditorStore.setSubmissionError(null)',
    ],
  },

  step7_auto_polling: {
    description: 'Frontend polls backend for execution status',
    loop: [
      'GET /api/submissions/:id/poll',
      'Backend checks Judge0 status',
      'If still processing: return status "processing"',
      'If complete: return final results',
      '',
      'Polling strategy: exponential backoff',
      '  Initial delay: 1s',
      '  Max delay: 5s',
      '  Max retries: 30',
    ],
  },

  step8_display_results: {
    description: 'Show results in SubmissionResultsPanel',
    displays: [
      'Status (accepted/wrong_answer/etc)',
      'Test results (10/10 passed)',
      'Execution time',
      'Memory used',
      'Code output',
      'Error messages',
      'Score (0-100)',
    ],
  },

  step9_next_action: {
    description: 'Based on result, offer next step',
    if_accepted: [
      'Button: "Start Viva Session →"',
      'Navigate to VivaSession component',
    ],
    if_wrong_answer: [
      'Message: "Not Accepted Yet"',
      'Allow editing code and resubmitting',
    ],
    if_compilation_error: [
      'Show error details',
      'Highlight error lines in editor',
      'Allow fixing and resubmitting',
    ],
  },
};

/**
 * DATA STORED IN EDITOR STORE
 * ===========================
 */
export const EDITOR_STORE_SUBMISSION_CONTEXT = {
  during_editing: {
    code: '# Student code here',
    language: 'python',
    topicId: 'topic-123',
    projectId: 'project-456',
    currentSubmission: null,
    isSubmitting: false,
  },

  during_submission: {
    code: '# Unchanged',
    language: 'python',
    topicId: 'topic-123',
    projectId: 'project-456',
    currentSubmission: {
      _id: 'sub-789',
      status: 'pending',
      code: '# Student code here',
      language: 'python',
    },
    isSubmitting: true,
  },

  after_execution: {
    code: '# Unchanged',
    language: 'python',
    topicId: 'topic-123',
    projectId: 'project-456',
    currentSubmission: {
      _id: 'sub-789',
      status: 'accepted',
      code: '# Student code here',
      language: 'python',
      testsPassed: 10,
      testsTotal: 10,
      score: 100,
      executionTime: 245,
      memoryUsed: 12345,
      stdout: 'Test output...',
    },
    isSubmitting: false,
  },
};

/**
 * MongoDB SUBMISSION SCHEMA (Future)
 * ==================================
 */
export const MONGODB_SUBMISSION_SCHEMA = {
  collection: 'submissions',
  fields: {
    _id: 'ObjectId (auto)',
    user: 'ObjectId (reference to User)',
    topic: 'ObjectId | string (reference to Topic)',
    code: 'string (max 50KB)',
    language: 'enum: python | javascript | java | cpp | c',
    judge0Token: 'string | null (execution token)',
    status: 'enum: pending | processing | accepted | wrong_answer | compilation_error | runtime_error | time_limit_exceeded | failed',
    stdout: 'string (output)',
    stderr: 'string (errors)',
    executionTime: 'number (ms)',
    memoryUsed: 'number (bytes)',
    testsPassed: 'number',
    testsTotal: 'number',
    score: 'number (0-100)',
    isAccepted: 'boolean',
    projectId: 'ObjectId? (optional)',
    createdAt: 'Date',
    updatedAt: 'Date',
  },
};

/**
 * TODO IMPLEMENTATION CHECKLIST
 * =============================
 */
export const TODO_CHECKLIST = {
  // TODO Comments in code:
  todo_locations: [
    'useEditorStore.ts - submitCode() TODO: Save submission to MongoDB',
    'useEditorStore.ts - enableAutoSave() TODO: Sync drafts with MongoDB',
    'useSubmissionStore.ts - pollSubmissionStatus() TODO: GET /api/submissions/:id/poll',
    'submissionService.ts - All methods: TODO: Connect to backend',
    'useEditorSubmit.ts - submitCode() TODO: Validate schema',
    'useSubmissionFlow.ts - handleSubmit() TODO: MongoDB integration',
  ],

  // Backend endpoints to implement:
  backend_endpoints: [
    'POST /api/submissions - create submission',
    'GET /api/submissions - list submissions',
    'GET /api/submissions/:id - get one',
    'GET /api/submissions/:id/poll - poll status',
    'POST /api/submissions/draft - save draft',
    'GET /api/submissions/draft/:topicId - load draft',
  ],

  // Services to connect:
  services_to_connect: [
    'Judge0 API (code execution)',
    'MongoDB Atlas (submission storage)',
    'Bull Queue (async job processing)',
  ],

  // Testing to do:
  testing: [
    'Unit tests for validation functions',
    'Integration tests for submission flow',
    'E2E tests for complete workflow',
    'Load testing for polling logic',
  ],
};

export default MONACO_EDITOR_ARCHITECTURE;
