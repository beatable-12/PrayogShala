/**
 * src/utils/submissionFlowIntegration.ts
 * Integration guide for Monaco Editor submission architecture
 * 
 * This file demonstrates how all pieces work together:
 * 1. useEditorStore - Manages editor code and context
 * 2. useSubmissionStore - Tracks submissions and polling
 * 3. useEditorSubmit - Main hook combining everything
 * 4. submissionService - API communication
 * 5. SubmissionResultsPanel - Display results
 * 6. SubmissionModal - Modal container
 * 
 * TODO: Save submission to MongoDB Atlas
 * 
 * USAGE EXAMPLE:
 * 
 * function CodeWorkspacePage() {
 *   // Initialize submission hook
 *   const {
 *     code,
 *     language,
 *     currentSubmissionId,
 *     isLoading,
 *     submissionError,
 *     submitCode,
 *   } = useEditorSubmit({
 *     topicId: 'two-pointers',
 *     projectId: 'project-123',
 *     onSubmissionSuccess: (submission) => {
 *       console.log('Submission successful:', submission);
 *       // Navigate to viva or show congratulations
 *     },
 *     onSubmissionError: (error) => {
 *       console.error('Submission failed:', error);
 *       // Show error notification
 *     },
 *   });
 *
 *   const { isModalOpen, openSubmissionModal } = useSubmissionUI();
 *   const submission = useSubmissionStore(s => s.getCurrentSubmission());
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await submitCode();
 *       openSubmissionModal();
 *     } catch (error) {
 *       // Error handled by hook
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <MonacoEditorPanel code={code} onCodeChange={setCode} />
 *       <button onClick={handleSubmit} disabled={isLoading}>
 *         {isLoading ? 'Submitting...' : 'Submit Code'}
 *       </button>
 *       {submissionError && <div>{submissionError}</div>}
 *       <SubmissionModal isOpen={isModalOpen}>
 *         <SubmissionResultsPanel submission={submission} />
 *       </SubmissionModal>
 *     </>
 *   );
 * }
 */

import { Submission } from '../types';

/**
 * Flow architecture document
 */
export const SUBMISSION_FLOW_ARCHITECTURE = {
  // Step 1: Initialize Editor State
  step1_initialize: {
    component: 'CodeWorkspacePage',
    store: 'useEditorStore',
    data: {
      code: '# Student code',
      language: 'python',
      topicId: 'topic-123',
      projectId: 'project-123',
    },
  },

  // Step 2: Student writes code
  step2_editing: {
    component: 'MonacoEditorPanel',
    action: 'onCodeChange',
    triggers: [
      'useAutoSave (every 10s) → localStorage',
      'TODO: useAutoSave should eventually call saveDraft to MongoDB',
    ],
  },

  // Step 3: Student clicks Submit
  step3_submit: {
    component: 'WorkspaceToolbar',
    action: 'handleSubmit',
    calls: [
      'useEditorSubmit.submitCode()',
    ],
  },

  // Step 4: Validate and submit
  step4_validation: {
    handler: 'useEditorSubmit.submitCode()',
    validations: [
      'code.length > 0',
      'code.length <= 50000',
      'topicId exists',
      'language is supported',
    ],
    submits_to: 'submissionService.submitCode(payload)',
    payload: {
      topicId: 'string',
      code: 'string',
      language: 'ProgrammingLanguage',
      stdin: 'string (optional)',
      // TODO: Additional fields when saved to MongoDB:
      // projectId?: 'string',
      // timestamp: 'ISO timestamp',
      // userId: 'from auth store',
    },
  },

  // Step 5: Service submits to API
  step5_service_call: {
    service: 'submissionService',
    endpoint: 'POST /api/submissions',
    backend_flow: [
      '1. Create Submission document in MongoDB',
      '   - sourceCode: string',
      '   - language: ProgrammingLanguage',
      '   - topicId: string',
      '   - projectId?: string',
      '   - timestamp: ISO timestamp',
      '   - user: ObjectId (from JWT)',
      '   - status: "pending"',
      '',
      '2. Submit code to Judge0 API',
      '   - Send sourceCode + language_id',
      '   - Get execution token',
      '   - Store token in Submission.judge0Token',
      '',
      '3. Start async polling (Bull queue)',
      '   - Poll Judge0 every 1s',
      '   - Update Submission.status as polling progresses',
      '   - Store results when complete',
      '',
      '4. Return Submission record',
      '   - Status: "pending" (Judge0 still executing)',
      '   - judge0Token: for polling',
      '   - Other fields will be populated when ready',
    ],
  },

  // Step 6: Store tracks submission
  step6_store_update: {
    store: 'useSubmissionStore',
    updates: [
      'addSubmission(submission) - store full submission',
      'setCurrentSubmissionId(submission._id)',
      'isPolling: true (wait for results)',
    ],
  },

  // Step 7: Auto-poll for results
  step7_polling: {
    function: 'useSubmissionFlow.handlePollStatus()',
    endpoint: 'GET /api/submissions/:id/poll',
    backend_behavior: [
      '1. Check current Submission.status in MongoDB',
      '2. If still processing:',
      '   - Check Judge0 status via polling queue',
      '   - Return status "processing" with partial results',
      '3. If complete:',
      '   - Get final results from MongoDB',
      '   - Return all execution details:',
      '     - stdout, stderr',
      '     - executionTime, memoryUsed',
      '     - testsPassed, testsTotal',
      '     - score (calculated from test results)',
      '     - status: "accepted" | "wrong_answer" | etc',
    ],
    polling_strategy: 'exponential backoff 1s → 5s, max 30 retries',
  },

  // Step 8: Update UI with results
  step8_results_display: {
    component: 'SubmissionResultsPanel',
    displays: [
      'Status (accepted/wrong_answer/etc)',
      'Test results (x/y passed)',
      'Execution stats (time, memory)',
      'Output/Errors',
      'Final score',
      'Next action button (Start Viva if accepted)',
    ],
  },

  // Step 9: Next steps based on result
  step9_next_action: {
    if_accepted: 'Navigate to VivaSession component',
    if_wrong_answer: 'Allow code editing and resubmission',
    if_error: 'Show error details and allow retry',
  },
};

/**
 * MongoDB schema for Submission
 * (Reference for backend implementation)
 */
export const SUBMISSION_MONGODB_SCHEMA = {
  _id: 'ObjectId (auto-generated)',
  user: 'ObjectId (reference to User)',
  topic: 'ObjectId | string (reference to Topic)',
  code: 'string (max 50KB)',
  language: 'enum: python | javascript | java | cpp | c',
  judge0Token: 'string | null (Judge0 API token)',
  status: 'enum: pending | processing | accepted | wrong_answer | time_limit_exceeded | compilation_error | runtime_error | failed',
  
  // Execution results
  stdout: 'string (output from code execution)',
  stderr: 'string (error output)',
  executionTime: 'number (milliseconds)',
  memoryUsed: 'number (bytes)',
  
  // Test results
  testsPassed: 'number (count of passed test cases)',
  testsTotal: 'number (total test cases)',
  score: 'number (0-100, based on tests passed)',
  isAccepted: 'boolean (score >= 80 or all tests passed)',
  
  // Metadata
  projectId: 'ObjectId? (reference to Project)',
  createdAt: 'ISO timestamp',
  updatedAt: 'ISO timestamp',
  
  // Indices
  indices: [
    '{ user: 1, topic: 1 } - query submissions for user+topic',
    '{ user: 1, createdAt: -1 } - latest submissions by user',
    '{ topic: 1, score: -1 } - leaderboard by topic',
  ],
};

/**
 * Store state flow
 */
export const EDITOR_STORE_STATE_FLOW = {
  before_submission: {
    code: '# Student code here',
    language: 'python',
    topicId: 'topic-123',
    projectId: 'project-123',
    currentSubmission: null,
    isSubmitting: false,
    submissionError: null,
  },

  during_submission: {
    code: '# Unchanged',
    language: 'python',
    topicId: 'topic-123',
    projectId: 'project-123',
    currentSubmission: {
      _id: 'sub-456',
      status: 'pending',
      // other fields...
    },
    isSubmitting: true,
    submissionError: null,
  },

  after_completion: {
    code: '# Unchanged',
    language: 'python',
    topicId: 'topic-123',
    projectId: 'project-123',
    currentSubmission: {
      _id: 'sub-456',
      status: 'accepted', // or 'wrong_answer', etc
      testsPassed: 10,
      testsTotal: 10,
      score: 100,
      executionTime: 245,
      memoryUsed: 12345,
      // other fields...
    },
    isSubmitting: false,
    submissionError: null,
  },
};

/**
 * TODO checklist for full implementation
 */
export const TODO_IMPLEMENTATION_CHECKLIST = [
  '[ ] MongoDB Atlas setup and connection',
  '[ ] Create Submission collection schema',
  '[ ] POST /api/submissions endpoint (create submission)',
  '[ ] Judge0 API integration',
  '[ ] Bull queue for async Judge0 polling',
  '[ ] GET /api/submissions/:id/poll endpoint (poll status)',
  '[ ] Test case evaluation logic',
  '[ ] Score calculation algorithm',
  '[ ] WebSocket for real-time polling (optional performance)',
  '[ ] Submission draft auto-save (POST /api/submissions/draft)',
  '[ ] Load draft functionality (GET /api/submissions/draft/:topicId)',
  '[ ] Submission stats endpoint (GET /api/submissions/topic/:topicId/stats)',
  '[ ] Error recovery and retry logic',
  '[ ] Rate limiting on submissions',
  '[ ] Audit logging for submissions',
];

export default SUBMISSION_FLOW_ARCHITECTURE;
