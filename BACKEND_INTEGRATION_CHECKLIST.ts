/**
 * BACKEND INTEGRATION CHECKLIST
 * =============================
 * 
 * This document outlines all API endpoints and backend implementations required
 * to transform PrayogShala from a hardcoded prototype into a production-ready system.
 * 
 * Each section below maps to a service layer and lists:
 * - API endpoint
 * - HTTP method
 * - Request body
 * - Response format
 * - Backend logic required
 * - Database models involved
 * - AI services needed
 * 
 * Priority levels:
 * 🔴 CRITICAL - Must implement for MVP
 * 🟡 HIGH - Important for core functionality
 * 🟢 MEDIUM - Nice to have for first version
 * 🔵 LOW - Future enhancement
 */

// ============================================================
// 1. AUTHENTICATION ENDPOINTS (authService.ts)
// ============================================================

/**
 * 🔴 CRITICAL: POST /api/auth/register
 * 
 * Request:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "securePassword123",
 *   "preferredLang": "Hindi"
 * }
 * 
 * Response:
 * {
 *   "user": { _id, name, email, role, preferredLang, xp, ... },
 *   "token": "jwt_token_here",
 *   "expiresIn": 86400
 * }
 * 
 * Backend Logic:
 * - Validate input (email format, password strength)
 * - Hash password with bcrypt
 * - Create User document in MongoDB
 * - Generate JWT token (payload: userId, email, role)
 * - Return user + token
 * 
 * Status: ✅ IMPLEMENTED (backend/controllers/authController.js)
 */

/**
 * 🔴 CRITICAL: POST /api/auth/login
 * 
 * Request:
 * {
 *   "email": "john@example.com",
 *   "password": "securePassword123"
 * }
 * 
 * Response: (same as register)
 * 
 * Backend Logic:
 * - Find user by email
 * - Compare password hash
 * - Generate JWT token
 * - Return user + token
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🔴 CRITICAL: GET /api/auth/me
 * 
 * Response: User document
 * 
 * Backend Logic:
 * - Verify JWT from Authorization header
 * - Return current user's full profile
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🔴 CRITICAL: PUT /api/auth/me
 * 
 * Request: { preferredLang?: "Tamil", ... }
 * Response: Updated User document
 * 
 * Backend Logic:
 * - Verify JWT
 * - Update user fields
 * - Return updated user
 * 
 * Status: ✅ IMPLEMENTED
 */

// ============================================================
// 2. MODULE ENDPOINTS (moduleService.ts)
// ============================================================

/**
 * 🔴 CRITICAL: GET /api/modules?published=1
 * 
 * Response: [Module, Module, ...]
 * 
 * Backend Logic:
 * - Fetch all published modules
 * - Populate topics array (optional)
 * - Sort by order field
 * - Return to frontend
 * 
 * TODO ISSUE: DashboardView.jsx has hardcoded modules (lines 4-68)
 * SOLUTION: Replace with API call to moduleService.getAllModules()
 * 
 * Status: ✅ IMPLEMENTED (backend/controllers/moduleController.js)
 */

/**
 * 🔴 CRITICAL: GET /api/modules/:id
 * 
 * Response: Module with populated topics
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🟡 HIGH: GET /api/modules/:id/progress
 * 
 * Response:
 * {
 *   "totalTopics": 5,
 *   "completedTopics": 2,
 *   "percentComplete": 40
 * }
 * 
 * Backend Logic:
 * - Get module's topics
 * - Count user's completed topics in this module
 * - Calculate percentage
 * 
 * TODO ISSUE: DashboardView shows "42% COMPLETE" hardcoded (line 85)
 * SOLUTION: Calculate from user.completedTopics array
 */

/**
 * 🟡 HIGH: POST /api/modules (admin)
 * 🟡 HIGH: PUT /api/modules/:id (admin)
 * 🟡 HIGH: DELETE /api/modules/:id (admin)
 * 
 * Status: ✅ IMPLEMENTED
 */

// ============================================================
// 3. TOPIC ENDPOINTS (topicService.ts)
// ============================================================

/**
 * 🔴 CRITICAL: GET /api/topics?published=1
 * 
 * Response: [Topic, Topic, ...]
 * 
 * Backend Logic:
 * - Fetch all published topics
 * - Populate module reference
 * - Include validationQuiz and projectTemplate
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🔴 CRITICAL: GET /api/topics/:slug
 * 
 * Response: Topic document
 * 
 * Backend Logic:
 * - Find topic by slug field
 * - Populate all nested data
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🔴 CRITICAL: POST /api/topics/:id/explain
 * 
 * Request: { language: "Hindi" }
 * 
 * Response:
 * {
 *   "explanation": "नमस्ते! Two Pointers का मतलब है..."
 * }
 * 
 * Backend Logic:
 * - Get topic by ID
 * - Get conceptText from topic
 * - Call Sarvam API to translate conceptText to target language
 * - Cache result in Redis or topic document
 * - Return translated explanation
 * 
 * TODO ISSUE: ConceptLabView has hardcoded Sarvam responses (lines 32-38)
 * SOLUTION: Call topicService.explainConcept(topicId, language)
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 * REQUIRES: Sarvam API integration in backend
 */

/**
 * 🔴 CRITICAL: POST /api/topics/:id/speak
 * 
 * Request: { language: "Hindi" }
 * 
 * Response:
 * {
 *   "audioBase64": "data:audio/wav;base64,..."
 * }
 * 
 * Backend Logic:
 * - Get explanation text (call Sarvam translate first if needed)
 * - Call Sarvam TTS API with translated text
 * - Return audio as base64
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 * REQUIRES: Sarvam TTS API integration
 */

/**
 * 🔴 CRITICAL: POST /api/topics/:id/validate
 * 
 * Request: { answer: "hash map" }
 * 
 * Response:
 * {
 *   "isCorrect": true,
 *   "feedback": "Correct! HashMap is often used...",
 *   "explanation": "Optional detailed explanation"
 * }
 * 
 * Backend Logic:
 * - Get topic's validationQuiz
 * - Compare answer against correctAnswer (case-insensitive, fuzzy match?)
 * - Update user's xp if correct
 * - Award XP_REWARD (250 default)
 * - Add topic to user.unlockedTopics if not already there
 * - Return response with isCorrect flag
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 * REQUIRES: Quiz validation logic
 */

/**
 * 🟡 HIGH: POST /api/topics/:id/hints
 * 
 * Request: {}
 * 
 * Response:
 * {
 *   "hint": "Remember to initialize both pointers..."
 * }
 * 
 * Backend Logic:
 * - Get topic
 * - Call Gemini to generate a hint for this topic
 * - Cache in MongoDB for rate limiting
 * - Return hint
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

// ============================================================
// 4. SUBMISSION ENDPOINTS (submissionService.ts)
// ============================================================

/**
 * 🔴 CRITICAL: POST /api/submissions
 * 
 * Request:
 * {
 *   "topicId": "507f1f77bcf86cd799439011",
 *   "code": "def solution(arr): return arr",
 *   "language": "python",
 *   "stdin": "input data"
 * }
 * 
 * Response: Submission document (with execution results)
 * 
 * Backend Logic:
 * 1. Validate input
 * 2. Create Submission document with status="pending"
 * 3. Get Judge0 language ID from language field
 * 4. Submit code to Judge0 via judge0Service.submitCode()
 * 5. Get token from Judge0
 * 6. Store token in submission.judge0Token
 * 7. Start polling thread/job to get results
 * 8. Return submission immediately (with status="processing")
 * 
 * TODO ISSUE: CodeWorkspaceView saves code only to localStorage (line 40)
 * SOLUTION: Call submissionService.submitCode() to store in MongoDB
 * 
 * Status: ⚠️ PARTIALLY IMPLEMENTED
 * ISSUE: Frontend sends code, backend should auto-poll Judge0
 * REQUIRES: Background job for polling
 */

/**
 * 🔴 CRITICAL: GET /api/submissions/:id
 * 
 * Response: Submission document (with all results from Judge0)
 * 
 * Backend Logic:
 * - Find submission by ID
 * - Verify user owns this submission
 * - Return full submission data
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🔴 CRITICAL: GET /api/submissions?topicId=X&page=1&limit=10
 * 
 * Response: { submissions: [...], total: 50, page: 1, limit: 10 }
 * 
 * Backend Logic:
 * - Query submissions for current user
 * - Filter by topicId if provided
 * - Paginate results
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🔴 CRITICAL: GET /api/submissions/:id/poll
 * 
 * Response: Updated Submission (with latest Judge0 results)
 * 
 * Backend Logic:
 * - Get submission
 * - If status is "processing", call Judge0 getResult(token)
 * - Update submission with results
 * - Update testsPassed, score, isAccepted
 * - Return updated submission
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🟡 HIGH: GET /api/submissions/topic/:topicId/latest
 * 
 * Response: Most recent Submission for this topic
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

/**
 * 🟡 HIGH: GET /api/submissions/topic/:topicId/best
 * 
 * Response: Submission with highest score for this topic
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

// ============================================================
// 5. PROJECT ENDPOINTS (projectService.ts)
// ============================================================

/**
 * 🔴 CRITICAL: POST /api/projects/generate
 * 
 * Request:
 * {
 *   "topicTitle": "Two Pointers",
 *   "difficulty": "EASY"
 * }
 * 
 * Response:
 * {
 *   "title": "Valid Palindrome Challenge",
 *   "description": "...",
 *   "starterCode": "class Solution: ...",
 *   "subtasks": [{ order: 1, title: "...", description: "...", isRequired: true }],
 *   "testCases": [{ input: "a b", expectedOutput: "true", isHidden: false }]
 * }
 * 
 * Backend Logic:
 * - Get topic by title
 * - If topic.projectTemplate exists, return it
 * - Otherwise, call Gemini API to generate project spec
 * - Cache in topic.projectTemplate
 * - Return project spec
 * 
 * TODO ISSUE: ProjectForgeView has hardcoded project data (lines 5-23)
 * SOLUTION: Call projectService.generateProjectIdea(topicTitle, difficulty)
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 * REQUIRES: Gemini integration in backend
 */

/**
 * 🟡 HIGH: POST /api/projects/:projectId/milestones
 * 
 * Response: { milestones: [...] }
 * 
 * Backend Logic:
 * - Get project/topic
 * - If milestones exist, return them
 * - Otherwise, call Gemini to break down project into milestones
 * - Cache in MongoDB
 * - Return milestones
 * 
 * TODO ISSUE: ProjectForgeView has hardcoded tasks (lines 35-40)
 * SOLUTION: Call projectService.generateMilestones(projectId)
 */

/**
 * 🟡 HIGH: POST /api/projects/:projectId/suggestions
 * 
 * Request: { code: "...", milestoneIndex: 1 }
 * 
 * Response: { suggestions: ["Try using...", "Consider..."] }
 * 
 * Backend Logic:
 * - Get project and current milestone
 * - Analyze code
 * - Call Gemini with code + milestone description
 * - Get suggestions for completing milestone
 * - Return suggestions
 */

/**
 * 🟡 HIGH: GET /api/topics/:topicId/project
 * 
 * Response: ProjectTemplate from topic
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

// ============================================================
// 6. VIVA ENDPOINTS (vivaService.ts)
// ============================================================

/**
 * 🔴 CRITICAL: POST /api/viva/start
 * 
 * Request: { submissionId: "507f1f77bcf86cd799439011" }
 * 
 * Response:
 * {
 *   "viva": Viva document,
 *   "firstQuestion": "Why did you choose HashMap instead of nested loops?"
 * }
 * 
 * Backend Logic:
 * 1. Get submission (verify isAccepted=true)
 * 2. Call Sarvam AI to analyze code:
 *    - Extract algorithms used
 *    - Extract data structures used
 *    - Identify optimizations
 *    - Identify weaknesses
 * 3. Call Gemini with code + analysis to generate first question
 * 4. Create Viva document in MongoDB
 * 5. Add first message (gemini question) to viva.messages
 * 6. Return viva + question
 * 
 * TODO ISSUE: No Viva generation in UI, no Sarvam code analysis
 * SOLUTION: 
 * - Create "Start Viva" button in UI after code accepted
 * - Call vivaService.startVivaSession(submissionId)
 * 
 * Status: ⚠️ PARTIALLY IMPLEMENTED (backend structure exists)
 * REQUIRES: 
 * - Sarvam code analysis API
 * - Gemini viva question generation
 * - Frontend UI to start viva
 */

/**
 * 🔴 CRITICAL: POST /api/viva/:id/answer
 * 
 * Request: { answer: "I used HashMap because it provides O(1) lookup..." }
 * 
 * Response:
 * {
 *   "score": 8,
 *   "feedback": "Good understanding of hash tables...",
 *   "nextQuestion": "What about space complexity?" or null
 * }
 * 
 * Backend Logic:
 * 1. Get viva by ID
 * 2. Add student's answer to viva.messages
 * 3. Call Gemini to:
 *    - Score the answer (0-10)
 *    - Provide feedback
 *    - Generate next question (or null if viva should end)
 * 4. Add Gemini's response to viva.messages
 * 5. Return score, feedback, nextQuestion
 * 
 * Status: ⚠️ PARTIALLY IMPLEMENTED
 * REQUIRES: Frontend viva UI to collect answers
 */

/**
 * 🔴 CRITICAL: POST /api/viva/:id/complete
 * 
 * Request: {}
 * 
 * Response: Completed Viva document
 * 
 * Backend Logic:
 * 1. Get viva
 * 2. Calculate total score (average of individual message scores)
 * 3. Call Gemini to generate final feedback
 * 4. Update viva.status = "completed"
 * 5. Update viva.totalScore
 * 6. Update viva.feedback
 * 7. Check if viva.isPassed (totalScore >= passingThreshold)
 * 8. If passed, trigger skill report generation
 * 9. Return updated viva
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

/**
 * 🔴 CRITICAL: GET /api/viva/:id
 * 
 * Response: Viva document with all messages
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🔴 CRITICAL: GET /api/viva
 * 
 * Response: [Viva, Viva, ...] for current user
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🟡 HIGH: POST /api/viva/analyze-code
 * 
 * Request: { code: "...", topicTitle: "Two Pointers" }
 * 
 * Response:
 * {
 *   "algorithmsUsed": ["two-pointer"],
 *   "dataStructuresUsed": ["array"],
 *   "optimizations": ["constant space", "single pass"],
 *   "timeComplexity": "O(n)",
 *   "spaceComplexity": "O(1)",
 *   "weaknesses": ["doesn't handle empty input"],
 *   "suggestions": ["Add edge case handling"]
 * }
 * 
 * Backend Logic:
 * - Call Sarvam AI to analyze code
 * - Extract key information
 * - Return analysis
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 * REQUIRES: Sarvam code analysis API (if available)
 * FALLBACK: Use Gemini for code analysis
 */

/**
 * 🟡 HIGH: GET /api/viva/resume/:submissionId
 * 
 * Response: Viva (if exists and in_progress) or null
 * 
 * Backend Logic:
 * - Find viva for this submission with status="in_progress"
 * - Return viva or null
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

// ============================================================
// 7. SKILL REPORT ENDPOINTS (skillReportService.ts)
// ============================================================

/**
 * 🔴 CRITICAL: POST /api/skill-reports/generate
 * 
 * Request: { submissionId: "...", vivaId: "..." }
 * 
 * Response: SkillReport document
 * 
 * Backend Logic:
 * 1. Get submission and viva
 * 2. Verify submission.isAccepted=true and viva.isPassed=true
 * 3. Extract scores:
 *    - conceptValidation = from quiz validation (if exists)
 *    - codeExecution = submission.score
 *    - vivaScore = viva.totalScore
 * 4. Calculate weighted overall score:
 *    - (conceptValidation × 0.2) + (codeExecution × 0.4) + (vivaScore × 0.4)
 * 5. Generate unique certificateId (UUID)
 * 6. Check if verified: overallScore >= 60
 * 7. Create SkillReport in MongoDB
 * 8. Return skill report
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

/**
 * 🔴 CRITICAL: GET /api/skill-reports/:id
 * 
 * Response: SkillReport document
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🔴 CRITICAL: GET /api/skill-reports
 * 
 * Response: [SkillReport, ...] for current user (paginated)
 * 
 * Status: ✅ IMPLEMENTED
 */

/**
 * 🟡 HIGH: PATCH /api/skill-reports/:id/verify
 * 
 * Request: {}
 * 
 * Response: Updated SkillReport with isVerified=true
 * 
 * Backend Logic:
 * - Verify all required docs are present
 * - Mark isVerified = true
 * - Set issuedAt = now
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

/**
 * 🟢 MEDIUM: GET /api/skill-reports/:id/certificate
 * 
 * Response: PDF file
 * 
 * Backend Logic:
 * - Get skill report
 * - Generate PDF certificate with:
 *   - Student name
 *   - Topic title
 *   - Overall score
 *   - Certificate ID
 *   - Issue date
 * - Return PDF blob
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 * REQUIRES: PDF generation library (pdfkit, etc)
 */

/**
 * 🟢 MEDIUM: POST /api/skill-reports/:id/share
 * 
 * Request: { platform: "linkedin" | "twitter" | "email" }
 * 
 * Response: { shareUrl: "..." }
 * 
 * Backend Logic:
 * - Generate shareable link (short URL or QR code)
 * - Link should verify certificate without login
 * - Return share URL
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

/**
 * 🟢 MEDIUM: GET /api/users/me/skills
 * 
 * Response:
 * {
 *   "topicsCompleted": 5,
 *   "averageScore": 82,
 *   "certificatesEarned": 3,
 *   "totalXp": 2500,
 *   "modules": [...]
 * }
 * 
 * Backend Logic:
 * - Get current user
 * - Count completedTopics
 * - Average SkillReport scores
 * - Count verified SkillReports
 * - Sum xp
 * - Return profile
 * 
 * Status: ❌ NOT IMPLEMENTED - TODO
 */

/**
 * 🔵 LOW: GET /api/skill-reports (admin)
 * 
 * Response: All SkillReports (paginated)
 * 
 * Status: ✅ IMPLEMENTED
 */

// ============================================================
// SUMMARY OF CRITICAL TODOs
// ============================================================

/**
 * PRIORITY ORDER FOR IMPLEMENTATION:
 * 
 * 1. ✅ EXISTING - Auth, Module, Topic, Submission APIs
 * 
 * 2. 🔴 CRITICAL - Implement these NOW:
 *    - Topic explain/speak (Sarvam translation)
 *    - Topic validation (quiz checking)
 *    - Project generation (Gemini)
 *    - Viva start & answer (code analysis + questions)
 *    - Viva complete (scoring + feedback)
 *    - Skill report generation
 * 
 * 3. 🟡 HIGH - Implement after critical:
 *    - Module/topic progress endpoints
 *    - Latest/best submission endpoints
 *    - Viva code analysis
 *    - Viva resume session
 *    - Skill report verification
 * 
 * 4. 🟢 MEDIUM - Nice to have:
 *    - Certificate PDF generation
 *    - Share links
 *    - User skill profile
 * 
 * 5. 🟠 KNOWN ISSUES:
 *    - Frontend still has hardcoded data in components
 *    - Need to refactor components to use services
 *    - Need error handling in all API calls
 *    - Need loading states in UI
 */

export {}; // Make this a module
