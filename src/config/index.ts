/**
 * src/config/index.ts
 * Centralized configuration for API endpoints, timeouts, and environment settings
 */

export const API_CONFIG = {
  // API Base URL - from environment or fallback to localhost
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',

  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  CODE_EXECUTION_TIMEOUT: 60000, // 60 seconds for Judge0
  POLLING_INTERVAL: 1000, // 1 second between Judge0 polls
  POLLING_MAX_RETRIES: 10,

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'prayogshala_auth_token',
    USER: 'prayogshala_user',
    CODE_SNAPSHOT: 'prayogshala_code_snapshot',
    SELECTED_MODULE: 'prayogshala_selected_module',
    SELECTED_TOPIC: 'prayogshala_selected_topic',
  },

  // AI Service Keys (these come from environment variables for security)
  JUDGE0_API_KEY: import.meta.env.VITE_JUDGE0_API_KEY || '',
  SARVAM_API_KEY: import.meta.env.VITE_SARVAM_API_KEY || '',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',

  // Feature flags
  FEATURES: {
    ENABLE_CODE_HINTS: true,
    ENABLE_AI_VIVA: true,
    ENABLE_SKILL_REPORTS: true,
    ENABLE_MULTILINGUAL: true,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  // XP & Scoring
  REWARDS: {
    TOPIC_COMPLETION: 250,
    MODULE_COMPLETION: 1000,
    VIVA_PASS_BONUS: 500,
    CODE_OPTIMIZATION_BONUS: 100,
  },

  // Passing thresholds
  THRESHOLDS: {
    CONCEPT_VALIDATION_PASS: 70,
    CODE_EXECUTION_PASS: 80,
    VIVA_PASS: 60,
    OVERALL_SKILL_REPORT_PASS: 60,
  },

  // Polling endpoints
  ENDPOINTS: {
    // Authentication
    AUTH_LOGIN: '/api/auth/login',
    AUTH_REGISTER: '/api/auth/register',
    AUTH_ME: '/api/auth/me',
    AUTH_UPDATE: '/api/auth/me',

    // Modules
    MODULES_LIST: '/api/modules',
    MODULES_GET: '/api/modules/:id',
    MODULES_CREATE: '/api/modules',
    MODULES_UPDATE: '/api/modules/:id',
    MODULES_DELETE: '/api/modules/:id',

    // Topics
    TOPICS_LIST: '/api/topics',
    TOPICS_GET_SLUG: '/api/topics/:slug',
    TOPICS_EXPLAIN: '/api/topics/:id/explain',
    TOPICS_SPEAK: '/api/topics/:id/speak',
    TOPICS_VALIDATE: '/api/topics/:id/validate',
    TOPICS_CREATE: '/api/topics',
    TOPICS_UPDATE: '/api/topics/:id',
    TOPICS_DELETE: '/api/topics/:id',

    // Submissions (Judge0 execution)
    SUBMISSIONS_CREATE: '/api/submissions',
    SUBMISSIONS_LIST: '/api/submissions',
    SUBMISSIONS_GET: '/api/submissions/:id',
    SUBMISSIONS_POLL: '/api/submissions/:id/poll',
    SUBMISSIONS_ANALYZE: '/api/submissions/:id/analyze',
    SUBMISSIONS_CANCEL: '/api/submissions/:id/cancel',

    // Viva (Sarvam Code-Aware Viva)
    VIVA_START: '/api/viva/start',
    VIVA_ANSWER: '/api/viva/:id/answer',
    VIVA_COMPLETE: '/api/viva/:id/complete',
    VIVA_GET: '/api/viva/:id',
    VIVA_LIST: '/api/viva',
    VIVA_ANALYSIS: '/api/viva/:id/analysis',
    VIVA_ABANDON: '/api/viva/:id/abandon',

    // Skill Reports
    REPORTS_GENERATE: '/api/skill-reports/generate',
    REPORTS_LIST: '/api/skill-reports',
    REPORTS_GET: '/api/skill-reports/:id',
    REPORTS_VERIFY: '/api/skill-reports/:id/verify',

    // ===== Sarvam AI Endpoints =====
    AI_CONCEPTS_EXPLAIN: '/api/ai/concepts/explain',
    AI_HINTS_GENERATE: '/api/ai/hints/generate',
    AI_CODE_REVIEW: '/api/ai/code/review',
    AI_CODE_ANALYZE: '/api/ai/code/analyze',
    AI_VIVA_QUESTIONS: '/api/ai/viva/questions',
    AI_VIVA_EVALUATE: '/api/ai/viva/evaluate',
    AI_TRANSLATE: '/api/ai/translate',
    AI_TEXT_TO_SPEECH: '/api/ai/text-to-speech',
    AI_DETECT_LANGUAGE: '/api/ai/detect-language',

    // ===== Gemini AI Endpoints =====
    PROJECTS_GENERATE: '/api/projects/generate',
    MILESTONES_GENERATE: '/api/milestones/generate',
  },
};

// TODO: Move to backend and remove from frontend
export const JUDGE0_CONFIG = {
  BASE_URL: import.meta.env.VITE_JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com',
  LANGUAGE_IDS: {
    python: 71,
    javascript: 63,
    java: 62,
    cpp: 54,
    c: 50,
  },
};

// TODO: Move to backend and remove from frontend
export const SARVAM_CONFIG = {
  BASE_URL: import.meta.env.VITE_SARVAM_BASE_URL || 'https://api.sarvam.ai/v2',
  LANGUAGE_CODES: {
    English: 'en-IN',
    Hindi: 'hi-IN',
    Tamil: 'ta-IN',
    Telugu: 'te-IN',
    Kannada: 'kn-IN',
    Bengali: 'bn-IN',
    Marathi: 'mr-IN',
  },
};

// TODO: Move to backend and remove from frontend
export const GEMINI_CONFIG = {
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  MODEL: 'gemini-1.5-flash',
};
