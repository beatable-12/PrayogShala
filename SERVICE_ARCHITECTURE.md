# PrayogShala Service Architecture

## Overview
Complete service layer for PrayogShala with 10 core services + supporting utilities. All services are designed with TODO markers for future backend integration.

## Service Layer Components

### Core Services (10)

#### 1. **authService.ts** - Authentication & User Management
- **Methods**: login, register, getCurrentUser, updateProfile, logout, isAuthenticated, getCachedUser, refreshToken, requestPasswordReset, resetPassword
- **Backend Endpoints**: 
  - POST /api/auth/login
  - POST /api/auth/register
  - GET /api/auth/me
  - PUT /api/auth/profile
  - POST /api/auth/refresh
  - POST /api/auth/forgot-password
  - POST /api/auth/reset-password
- **TODOs**: Connect MongoDB, JWT token refresh, session management, email verification

#### 2. **moduleService.ts** - Learning Modules Management
- **Methods**: getAllModules, getModuleById, createModule, updateModule, deleteModule, getModuleProgress, getModulesByDifficulty, searchModules
- **Backend Endpoints**:
  - GET /api/modules
  - GET /api/modules/:id
  - POST /api/modules
  - PUT /api/modules/:id
  - DELETE /api/modules/:id
  - GET /api/modules/:id/progress
- **TODOs**: Connect MongoDB, implement caching, popularity analytics, soft delete

#### 3. **topicService.ts** - Topic Learning & Validation
- **Methods**: getAllTopics, getTopicBySlug, getTopicById, explainConcept, speakConcept, validateAnswer, createTopic, updateTopic, deleteTopic, getHint, getTopicsByModule, getTopicProgress
- **Backend Endpoints**:
  - GET /api/topics
  - GET /api/topics/:slug
  - POST /api/topics/:id/explain (Sarvam AI)
  - POST /api/topics/:id/speak (Sarvam TTS)
  - POST /api/topics/:id/validate
  - GET /api/topics/:id/hints
- **TODOs**: Connect Sarvam AI, implement caching, fuzzy answer matching

#### 4. **projectService.ts** - Project Generation with AI
- **Methods**: generateProjectIdea, generateMilestones, getCompletionSuggestions, getProjectTemplate, createProject, getUserProjects, getProjectById, updateProject, completeProject
- **Backend Endpoints**:
  - POST /api/projects/generate (Gemini)
  - POST /api/projects/:id/milestones (Gemini)
  - POST /api/projects/:id/suggestions (Gemini)
  - GET /api/topics/:topicId/project
  - GET /api/projects
  - PUT /api/projects/:id
- **TODOs**: Connect Gemini API, validate project templates, milestone tracking

#### 5. **submissionService.ts** - Code Execution & Storage
- **Methods**: submitCode, getSubmissions, getSubmissionById, pollSubmissionResult, waitForExecutionResult, saveCodeSnapshot, loadCodeSnapshot, clearCodeSnapshot, getLatestSubmission, getBestSubmission, getSubmissionsByStatus
- **Backend Endpoints**:
  - POST /api/submissions (Judge0)
  - GET /api/submissions
  - GET /api/submissions/:id
  - GET /api/submissions/:id/poll (Judge0)
  - GET /api/submissions/topic/:topicId/latest
  - GET /api/submissions/topic/:topicId/best
- **TODOs**: Connect Judge0, polling with exponential backoff, test case aggregation

#### 6. **judge0Service.ts** - Code Execution API
- **Methods**: submitExecution, pollExecutionStatus, getExecutionResults, cancelExecution, getLanguageId, mapStatusIdToSubmissionStatus
- **Judge0 Integration**:
  - POST /submissions (submit code)
  - GET /submissions/{token} (poll status)
  - Language ID mapping (Python, JS, Java, C++, C)
- **TODOs**: Connect Judge0 API, rate limiting, test case evaluation, status mapping

#### 7. **sarvamService.ts** - AI Code Analysis & Translation
- **Methods**: analyzeCode, translateContent, textToSpeech, detectLanguage, batchTranslate
- **Sarvam Integration**:
  - Code analysis (algorithms, data structures, complexity)
  - Multi-language translation
  - Text-to-speech for accessibility
- **TODOs**: Connect Sarvam API, caching, batch operations, language validation

#### 8. **geminiService.ts** - AI Content Generation
- **Methods**: generateProject, generateMilestones, generateVivaQuestion, evaluateVivaAnswer, generateVivaSummary, buildProjectGenerationPrompt, buildVivaPrompt
- **Gemini Integration**:
  - Project generation from topics
  - Milestone creation
  - Viva question generation
  - Answer evaluation
  - Summary generation
- **TODOs**: Connect Gemini API, prompt engineering, context management, cost tracking

#### 9. **vivaService.ts** - AI Viva Session Management
- **Methods**: startVivaSession, submitAnswer, completeViva, getVivaById, getUserVivas, analyzeCodeForViva, resumeVivaSession, abandonViva, getTopicVivas
- **Backend Endpoints**:
  - POST /api/vivas (Sarvam + Gemini)
  - POST /api/vivas/:id/answer (Gemini)
  - POST /api/vivas/:id/complete (Gemini)
  - GET /api/vivas/:id
  - GET /api/vivas
  - POST /api/viva/analyze-code (Sarvam)
  - GET /api/viva/resume/:submissionId
- **TODOs**: Connect Gemini & Sarvam, conversation context, timeout handling

#### 10. **skillReportService.ts** - Certification & Credentials
- **Methods**: generateReport, getReportById, getUserReports, verifyReport, getAllReports, downloadCertificate, generateShareLink, getUserSkillProfile, getTopicReports, exportAllCertificates
- **Backend Endpoints**:
  - POST /api/skill-reports
  - GET /api/skill-reports/:id
  - GET /api/skill-reports
  - PATCH /api/skill-reports/:id/verify
  - GET /api/skill-reports/:id/certificate
  - POST /api/skill-reports/:id/share
  - GET /api/users/me/skills
- **Score Calculation**:
  - Quiz: 20%
  - Code Execution: 40%
  - Viva: 40%
- **TODOs**: Connect MongoDB, PDF generation, social sharing, aggregation

### Supporting Infrastructure

#### **apiClient.ts** - Centralized HTTP Client
- **Features**:
  - Fetch-based HTTP requests
  - Automatic token management
  - Request/response headers
  - Error handling and authorization
  - Timeout management
- **Methods**: get, post, put, delete, patch, setToken, getToken, clearToken

#### **index.ts** - Service Exports
- Centralized export point for all services
- Config exports for API endpoints

## Service Integration Flow

### Complete Learning Journey

1. **User Authentication** (authService)
   - Login/Register
   - Token management
   - Profile updates

2. **Module & Topic Discovery** (moduleService, topicService)
   - Browse modules and topics
   - Read concepts with translations (Sarvam)
   - Listen to audio explanations (Sarvam TTS)
   - Validate concept understanding with quiz

3. **Project-Based Learning** (projectService, submissionService, judge0Service)
   - Generate project idea (Gemini)
   - Generate milestones (Gemini)
   - Submit code for execution (Judge0)
   - Poll execution results
   - Get code optimization suggestions (Gemini)

4. **AI Viva Session** (vivaService, sarvamService, geminiService)
   - Analyze submitted code (Sarvam)
   - Generate personalized questions (Gemini)
   - Evaluate answers (Gemini)
   - Generate final feedback

5. **Certification** (skillReportService)
   - Generate skill report with weighted scores
   - Download certificate (PDF)
   - Share on social media
   - Build skill profile

## TODO Markers Summary

### Backend Integration
- [ ] Connect MongoDB Atlas for all data persistence
- [ ] Connect Judge0 API for code execution
- [ ] Connect Sarvam AI API for translations and TTS
- [ ] Connect Google Gemini API for content generation

### Core Features
- [ ] Implement JWT token refresh logic
- [ ] Add session management and token expiration
- [ ] Implement soft delete for modules/topics
- [ ] Add email verification for registration
- [ ] Implement role-based access control (RBAC)

### Caching & Performance
- [ ] Implement response caching with TTL
- [ ] Cache concept explanations by language
- [ ] Cache audio files to reduce API calls
- [ ] Implement request deduplication

### Polling & Execution
- [ ] Judge0 polling with exponential backoff
- [ ] Timeout handling for code execution
- [ ] Test case result aggregation
- [ ] Status code mapping for all Judge0 responses

### AI Integration
- [ ] Prompt engineering for consistent responses
- [ ] Conversation context management for viva
- [ ] Cost tracking for API usage
- [ ] Response validation and parsing

### Advanced Features
- [ ] Milestone achievement notifications
- [ ] Learning streak tracking
- [ ] Difficulty-based recommendations
- [ ] Social media sharing integration
- [ ] PDF certificate generation
- [ ] Analytics and reporting

## Error Handling

All services use centralized error handling:
- Custom `PrayogShalaError` class
- Status codes and error codes
- Detailed error messages for debugging
- Network error detection

## Type Safety

All services use TypeScript interfaces from `src/types/`:
- Type-safe request/response handling
- No `any` types used
- Union types for flexible references (e.g., `string | Topic`)

## Configuration

All services use centralized config from `src/config`:
- `API_CONFIG`: Base URLs and endpoints
- `JUDGE0_CONFIG`: Judge0 API settings
- `SARVAM_CONFIG`: Sarvam AI credentials
- `GEMINI_CONFIG`: Gemini API settings
