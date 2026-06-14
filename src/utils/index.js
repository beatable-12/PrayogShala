export { getApiBaseUrl } from './apiUrl';
export { getDefaultCode, getCodeStorageKey } from './codeTemplates';
export {
  validateSubmission,
  validateCodeSyntax,
  hasCodeChanged,
  estimateCodeComplexity,
  getLanguageExtension,
  getLanguageDisplayName,
  validateSubmissionResult,
  estimateExecutionTime,
  SUBMISSION_VALIDATION_RULES,
} from './submissionValidation';
export { MONACO_EDITOR_ARCHITECTURE, COMPLETE_SUBMISSION_FLOW, EDITOR_STORE_SUBMISSION_CONTEXT, MONGODB_SUBMISSION_SCHEMA, TODO_CHECKLIST } from './monacoEditorArchitecture';
export { SUBMISSION_ARCHITECTURE_SUMMARY, QUICK_START, STATE_FLOW, DEBUGGING } from './SUBMISSION_ARCHITECTURE_SUMMARY';
export { FINAL_CHECKLIST, STATISTICS, COMPLETION_STATEMENT } from './FINAL_CHECKLIST';
export { NEW_FILES, UPDATED_FILES, ARCHITECTURE_OVERVIEW, INTEGRATION_TODO, VERIFICATION, PROJECT_STATISTICS, COMPLETION_SUMMARY } from './IMPLEMENTATION_STATUS';
