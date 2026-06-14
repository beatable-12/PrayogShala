# PrayogShala Backend - Implementation Guide

## 📖 Complete File-by-File Documentation

This guide explains every file in the backend, what it does, and how it fits into the system.

---

## 🔧 Configuration Files

### `config/db.js` - MongoDB Connection

**Purpose**: Establishes connection to MongoDB Atlas using Mongoose.

**What it does**:
1. Calls `mongoose.connect()` with MONGO_URI from environment
2. Sets up event listeners for connection state changes
3. Logs connection status and errors
4. Exits process if connection fails

**Called by**: `server.js` during startup

```javascript
import connectDB from './config/db.js';
await connectDB(); // In server startup
```

**Key Points**:
- Uses async/await pattern
- Connection events: 'connected', 'error', 'disconnected'
- No options needed (defaults in Mongoose 7+ are fine)

---

## 👤 Models - Data Structures

### `models/User.js` - User Document Schema

**Collections**: `users` in MongoDB

**Fields**:
- `name` - User's display name (2-50 chars)
- `email` - Unique identifier, auto-lowercased
- `password` - Bcrypt hashed (12-salt rounds), select=false by default
- `role` - Either 'student' (default) or 'admin'
- `preferredLang` - Native language for Sarvam translations (7 Indian languages)
- `xp` - Total experience points earned
- `unlockedTopics` - Array of Topic IDs user has unlocked via validation
- `completedTopics` - Array of Topic IDs user has fully completed

**Hooks**:
- Pre-save: Hashes password with bcrypt (only if modified)

**Methods**:
- `matchPassword(candidatePassword)` - Compare plain text with hash (used during login)

**Example Usage**:
```javascript
import User from '../models/User.js';

// Create user
const user = await User.create({
  name: "Raj Kumar",
  email: "raj@example.com",
  password: "plain123", // Will be hashed automatically
  preferredLang: "Hindi"
});

// Login - verify password
const user = await User.findOne({ email }).select('+password');
const isMatch = await user.matchPassword(candidatePassword);

// Get user without password
const user = await User.findById(userId); // password excluded by default
```

### `models/Module.js` - Curriculum Module Schema

**Collections**: `modules` in MongoDB

**Fields**:
- `title` - Module name (e.g., "Arrays & Hashing")
- `description` - What students learn in this module
- `order` - Display sequence (ascending)
- `icon` - Material Symbol icon name for UI
- `totalLessons` - Count of topics in this module
- `estimatedHours` - Total learning time estimate
- `topics` - Array of Topic IDs in this module
- `isPublished` - If false, hidden from students (draft mode)

**Example Usage**:
```javascript
import Module from '../models/Module.js';

// Get all published modules with topics
const modules = await Module.find({ isPublished: true })
  .populate('topics', 'title slug difficulty')
  .sort('order');
```

### `models/Topic.js` - DSA Topic Schema

**Collections**: `topics` in MongoDB

**Sub-schemas**:
- `validationQuiz` - MCQ/code-fill question to verify concept understanding
- `projectTemplate` - Starter code + test cases for Project Forge

**Fields**:
- `module` - Parent Module ID
- `title` - Topic name (e.g., "Two Pointers")
- `slug` - URL-friendly identifier (e.g., "two-pointers")
- `conceptText` - English explanation passed to Sarvam for translation
- `difficulty` - EASY / MEDIUM / HARD
- `xpReward` - XP awarded on completion
- `estimatedMinutes` - Time to complete
- `validationQuiz`:
  - `question` - The quiz question
  - `options` - Array of choices (for MCQ)
  - `correctAnswer` - Answer key
  - `type` - 'mcq' | 'code-fill' | 'true-false'
- `projectTemplate`:
  - `language` - python | javascript | java | cpp
  - `starterCode` - Pre-filled code with TODO comments
  - `testCases` - Array of {input, expectedOutput, isHidden}
  - `subtasks` - Step-by-step project breakdown

**Example Usage**:
```javascript
import Topic from '../models/Topic.js';

// Get topic by slug
const topic = await Topic.findOne({ slug: 'two-pointers', isPublished: true })
  .select('-validationQuiz.correctAnswer') // Hide answer

// Get with everything
const topic = await Topic.findOne({ slug: 'two-pointers' });
const conceptText = topic.conceptText; // Pass to Sarvam
const testCases = topic.projectTemplate.testCases; // For Judge0
```

### `models/Submission.js` - Code Submission Record

**Collections**: `submissions` in MongoDB

**Fields**:
- `user` - Student who submitted
- `topic` - Which topic this submission is for
- `code` - The source code submitted
- `language` - python | javascript | java | cpp
- `judge0Token` - Token for polling Judge0 API
- `status` - pending | processing | accepted | wrong_answer | compilation_error | runtime_error | failed
- `stdout` - Program output
- `stderr` - Error messages from compiler/runtime
- `executionTime` - Milliseconds
- `memoryUsed` - KB
- `testsPassed` - Count of test cases that passed
- `testsTotal` - Total test cases
- `score` - Auto-calculated percentage (testsPassed / testsTotal * 100)
- `isAccepted` - True when testsPassed === testsTotal

**Hooks**:
- Pre-save: Auto-calculates score and isAccepted

**Constants**:
- `LANGUAGE_IDS` - Maps language names to Judge0 language IDs

**Example Usage**:
```javascript
import Submission from '../models/Submission.js';
import { LANGUAGE_IDS } from '../models/Submission.js';

const languageId = LANGUAGE_IDS['python']; // 71

const submission = await Submission.create({
  user: userId,
  topic: topicId,
  code: "def solve(arr):\n    return sorted(arr)",
  language: 'python'
});

// After execution completes
submission.status = 'accepted';
submission.testsPassed = 3;
submission.testsTotal = 3;
await submission.save(); // Auto-calculates: score=100, isAccepted=true
```

### `models/Viva.js` - AI Viva Session Record

**Collections**: `vivas` in MongoDB

**Sub-schema**:
- `messages` - Ordered array of Q&A exchanges

**Fields**:
- `user` - Student taking viva
- `submission` - The code being evaluated (must be accepted)
- `topic` - Topic this viva is for
- `messages`:
  - `role` - 'gemini' | 'student'
  - `content` - The question or answer text
  - `score` - 0-10 for student answers, null for questions
  - `timestamp` - When message was created
- `totalScore` - Aggregate score (0-100)
- `feedback` - Gemini's overall performance summary
- `status` - 'in_progress' | 'completed' | 'abandoned'
- `isPassed` - True if totalScore >= passingThreshold (60)
- `passingThreshold` - Default 60

**Hooks**:
- Pre-save: Sets isPassed based on totalScore

**Example Usage**:
```javascript
import Viva from '../models/Viva.js';

// Start new viva
const viva = await Viva.create({
  user: userId,
  submission: submissionId,
  topic: topicId,
  messages: [
    { role: 'gemini', content: 'Explain your approach' }
  ]
});

// Add student answer with score
viva.messages.push({
  role: 'student',
  content: 'I used two pointers...',
  score: 8
});
viva.messages.push({
  role: 'gemini',
  content: 'Good! Now...'
});
await viva.save(); // Auto-calculates totalScore, isPassed
```

### `models/SkillReport.js` - Digital Credential

**Collections**: `skillreports` in MongoDB

**Fields**:
- `user` - Student who earned the certificate
- `topic` - The topic they were certified in
- `submission` - The accepted code submission
- `viva` - The passed viva session
- `overallScore` - Weighted average (0-100)
- `breakdown`:
  - `conceptValidation` - Quiz score (20% weight)
  - `codeExecution` - Test pass percentage (40% weight)
  - `vivaScore` - Viva performance (40% weight)
- `certificateId` - Unique public ID for verification (e.g., SR-abc123xyz)
- `languageUsed` - The native language student learned in
- `isVerified` - True once criteria met and issued
- `issuedAt` - Timestamp when certificate was issued

**Hooks**:
- Pre-save: Calculates overallScore as weighted average
- Pre-save: Sets isVerified=true and issuedAt if score >= 60

**Example Usage**:
```javascript
import SkillReport from '../models/SkillReport.js';

const report = await SkillReport.create({
  user: userId,
  topic: topicId,
  submission: submissionId,
  viva: vivaId,
  breakdown: {
    conceptValidation: 90,  // Student got quiz right
    codeExecution: 100,     // All tests passed
    vivaScore: 75           // Viva performance
  },
  certificateId: 'SR-abc123xyz'
});
// After save: overallScore = 90*0.2 + 100*0.4 + 75*0.4 = 87
// isVerified = true (87 >= 60)
// issuedAt = current timestamp
```

---

## 🎮 Controllers - Business Logic

### `controllers/authController.js` - Authentication

**Exports**:

#### `register(req, res)`
- Extracts: name, email, password, preferredLang
- Validates email not already registered
- Creates new User (password auto-hashed)
- Generates JWT token
- Returns: { token, user }

#### `login(req, res)`
- Extracts: email, password
- Looks up user and explicitly selects password
- Compares password with bcrypt
- Generates JWT token
- Returns: { token, user }

#### `getMe(req, res)`
- Uses req.user (attached by protect middleware)
- Populates unlockedTopics and completedTopics
- Returns: { user }

#### `updateMe(req, res)`
- Extracts: name, preferredLang
- Updates User document
- Returns: { user }

### `controllers/moduleController.js` - Curriculum Management

#### `getAllModules(req, res)`
- Gets all published modules
- Populates topics array
- Sorts by order field
- Returns: { count, modules }

#### `getModuleById(req, res)`
- Gets single module by ID
- Populates topics
- Returns: { module }

#### `createModule(req, res)` - Admin only
- Creates new Module document
- Returns: { module }

#### `updateModule(req, res)` - Admin only
- Updates module fields
- Returns: { module }

#### `deleteModule(req, res)` - Admin only
- Deletes module (does NOT delete topics)
- Returns: success message

### `controllers/topicController.js` - Learning Content

#### `getAllTopics(req, res)`
- Gets all published topics
- Optional filter by ?module=moduleId
- Hides correct answers
- Returns: { count, topics }

#### `getTopicBySlug(req, res)`
- Gets topic by URL-friendly slug
- Hides correct answer
- Populates parent module
- Returns: { topic }

#### `explainTopic(req, res)` - Protected
- Calls Sarvam AI to translate conceptText
- Translates to user's preferredLang or specified language
- Returns: { originalText, translatedText, language, topicTitle }

#### `speakTopic(req, res)` - Protected
- Calls Sarvam AI for text-to-speech
- Generates audio in user's language
- Returns: { audioBase64, language }

#### `validateAnswer(req, res)` - Protected
- Gets topic by slug
- Compares student's answer with correctAnswer
- If correct: adds topic to user's unlockedTopics
- Returns: { isCorrect, explanation, projectUnlocked, projectTemplate }

#### `createTopic(req, res)` - Admin only
- Creates Topic document
- Adds to parent module's topics array
- Increments module's totalLessons
- Returns: { topic }

#### `updateTopic(req, res)` - Admin only
- Updates topic fields
- Returns: { topic }

#### `deleteTopic(req, res)` - Admin only
- Deletes topic
- Returns: success message

### `controllers/submissionController.js` - Code Execution

#### `submitCodeHandler(req, res)` - Protected
1. Validates code, language, topic exist
2. Creates pending Submission record immediately
3. Calls judge0Service.submitCode() to sandbox
4. Runs against all visible test cases
5. Counts testsPassed
6. Updates Submission with results
7. If accepted: awards XP + adds to completedTopics
8. Returns: { submission }

#### `getSubmissions(req, res)` - Protected
- Gets submissions by current user
- Optional filter by ?topicId
- Sorted newest first
- Returns: { count, submissions }

#### `getSubmissionById(req, res)` - Protected
- Gets single submission by ID (auth check: must be user's)
- Populates topic details
- Returns: { submission }

#### `pollSubmission(req, res)` - Protected
- Gets submission and its judge0Token
- Calls judge0Service.getResult(token)
- If execution complete, updates Submission
- Returns: { submission } with latest status

### `controllers/vivaController.js` - AI Interview

#### `startVivaSession(req, res)` - Protected
1. Validates submission is accepted
2. Checks for existing in-progress viva (resume if exists)
3. Calls geminiService.startViva() with code
4. Creates Viva document with first Gemini question
5. Returns: { viva, currentQuestion }

#### `submitAnswer(req, res)` - Protected
1. Gets Viva and validates in_progress status
2. Gets last Gemini message (the question)
3. Calls geminiService.evaluateAnswer(code, question, answer)
4. Receives: score (0-10), feedback, nextQuestion
5. Adds student answer with score to messages
6. If nextQuestion provided, adds it
7. If no nextQuestion OR 3 questions asked: complete viva
8. Calls geminiService.generateFinalFeedback()
9. Calculates totalScore as average of answer scores
10. Sets status='completed'
11. Returns: { viva, answerFeedback, isCompleted }

#### `completeViva(req, res)` - Protected
- Manually finalize a viva session
- Gets feedback summary
- Calculates totalScore
- Sets status='completed'
- Returns: { viva }

#### `getVivaById(req, res)` - Protected
- Gets viva by ID (auth check: must be user's)
- Populates topic and submission details
- Returns: { viva }

#### `getUserVivas(req, res)` - Protected
- Gets all vivas for current user
- Populates topic and submission
- Sorted newest first
- Returns: { count, vivas }

### `controllers/skillReportController.js` - Certificates

#### `generateReport(req, res)` - Protected
1. Validates submission, viva, topic all exist
2. Checks submission is accepted AND viva is passed
3. Checks no report already issued for this combo
4. Generates unique certificateId
5. Extracts scores from submission and viva
6. Creates SkillReport (hooks auto-calculate overall score)
7. Adds topic to user's completedTopics
8. Returns: { skillReport, certificateId }

#### `getReportById(req, res)` - Protected
- Gets report by ID
- Populates all relationships (user, topic, submission, viva)
- Auth check: user can see own, or anyone if isVerified
- Returns: { skillReport }

#### `getUserReports(req, res)` - Protected
- Gets all reports for current user
- Sorted newest first
- Returns: { count, skillReports }

#### `verifyReport(req, res)` - Public
- Gets report by certificateId (public verification)
- Only shows if isVerified=true
- Returns: { skillReport } with public info
- Example: /verify/SR-abc123xyz

#### `getAllReports(req, res)` - Admin only
- Gets all verified reports
- Optional filters: ?userId, ?topicId
- Returns: { count, skillReports }

---

## 🔐 Middleware - Request Processing

### `middleware/authMiddleware.js` - JWT Verification

#### `protect(req, res, next)`
1. Extracts token from Authorization header (Bearer scheme)
2. If no token: return 401
3. Verifies JWT signature with JWT_SECRET
4. Decodes to get user ID
5. Looks up User by ID (excludes password)
6. Attaches req.user to request
7. Calls next() to proceed
8. Handles TokenExpiredError and JsonWebTokenError

#### `adminOnly(req, res, next)`
1. Checks req.user.role === 'admin'
2. If yes: calls next()
3. If no: returns 403 Forbidden

### `middleware/errorMiddleware.js` - Error Handling

#### `notFound(req, res, next)`
- Catches requests to undefined routes
- Creates 404 error and forwards to errorHandler

#### `errorHandler(err, req, res, next)`
1. Determines appropriate HTTP status code
2. Handles specific error types:
   - **CastError** (invalid ObjectId) → 404
   - **Duplicate key** (unique constraint) → 409
   - **ValidationError** (Mongoose validation) → 422
   - **JsonWebTokenError** → 401
3. Dev mode: includes stack trace
4. Prod mode: hides technical details
5. Returns standardized error JSON

### `middleware/validateMiddleware.js` - Input Validation

#### `validateRequest(req, res, next)`
1. Calls validationResult() from express-validator
2. If validation failed:
   - Formats errors as array of { field, message }
   - Returns 422 with errors
3. If validation passed: calls next()

---

## 🤖 Services - External Integrations

### `services/judge0Service.js` - Code Sandbox

#### `submitCode(code, languageId, stdin)`
- Encodes code and stdin as base64
- POST to Judge0 /submissions endpoint
- Includes CPU time limit (5s) and memory limit (128MB)
- Returns: token for polling

#### `getResult(token)`
- GET from Judge0 /submissions/{token}
- Decodes base64 response fields
- Maps Judge0 status IDs to app status strings
- Returns: { token, statusId, status, statusDescription, stdout, stderr, executionTime, memoryUsed }

#### `runAndWait(code, languageId, stdin, maxRetries=10)`
1. Calls submitCode() → gets token
2. Loop 10 times (max):
   - Wait 1 second
   - Call getResult()
   - If status is In Queue/Processing: continue loop
   - Else: return result
3. If maxRetries exceeded: throws timeout error

### `services/geminiService.js` - AI Viva

#### `callGemini(systemInstruction, userPrompt)`
- Base function for all Gemini calls
- POST to Gemini API with:
  - System instruction
  - User message
  - JSON response format
  - Temperature 0.4 (consistent but varied)
- Returns: parsed JSON response

#### `generateProjectIdea(topicTitle, difficulty)`
- Generates project spec from DSA topic
- Returns: { title, description, starterCode, subtasks, testCases }
- *Note: Not currently used in flow*

#### `startViva(code, topicTitle, language)`
- Prompt: Analyze code, ask ONE specific question
- Returns: { question }

#### `evaluateAnswer(code, question, studentAnswer, topicTitle)`
- Prompt: Score answer 0-10, give feedback, suggest next question
- Returns: { score (0-10), feedback, nextQuestion (or null) }

#### `generateFinalFeedback(messages, topicTitle)`
- Prompt: Summarize viva performance
- Returns: { summary, strengths[], improvements[] }

### `services/sarvamService.js` - Translation & TTS

**Language Codes**:
- English → en-IN
- Hindi → hi-IN
- Tamil → ta-IN
- Telugu → te-IN
- Kannada → kn-IN
- Bengali → bn-IN
- Marathi → mr-IN

#### `translateText(text, targetLang)`
1. Maps language name to Sarvam code
2. If English: returns text as-is (no API call)
3. Else: POST to Sarvam /translate with:
   - Input text
   - source: en-IN
   - target: language code
   - Mode: formal
4. Returns: { translatedText, detectedLanguage }

#### `textToSpeech(text, targetLang)`
1. Maps language to Sarvam code
2. POST to Sarvam /text-to-speech with:
   - Text (limited to 500 chars)
   - Target language
   - Speaker: meera (female)
   - Pitch, pace, loudness settings
3. Returns: { audioBase64 } (can be used as src for Audio tag)

---

## 🛠️ Utilities - Helper Functions

### `utils/asyncHandler.js`

**Purpose**: Wraps async route handlers to automatically catch errors

```javascript
// Without asyncHandler (repetitive):
app.get('/route', async (req, res, next) => {
  try {
    await someOp();
    res.json(...);
  } catch (err) {
    next(err);
  }
});

// With asyncHandler (clean):
app.get('/route', asyncHandler(async (req, res) => {
  await someOp();
  res.json(...);
}));
```

### `utils/apiResponse.js`

**Purpose**: Standardizes JSON response format across API

#### `successResponse(res, statusCode, message, data)`
```javascript
return res.status(200).json({
  success: true,
  message: "Operation completed",
  data: { user: {...} }
});
```

#### `errorResponse(res, statusCode, message, errors)`
```javascript
return res.status(400).json({
  success: false,
  message: "Validation failed",
  errors: [{ field: "email", message: "Invalid email" }]
});
```

### `utils/generateToken.js`

**Purpose**: Creates signed JWT tokens

```javascript
const token = generateToken(userId);
// Token payload: { id: userId }
// Signed with JWT_SECRET
// Expires in JWT_EXPIRES_IN (default 7d)
```

---

## 🚀 Main Application File

### `server.js` - Express App Setup

**Initialization**:
1. Loads environment variables with dotenv
2. Imports all controllers, middleware
3. Creates Express app instance
4. Sets up security middleware (helmet, CORS)
5. Sets up body parsers and logging (morgan)
6. Sets up rate limiting

**Route Registration**:
- All routes defined inline (consolidated for simplicity)
- Routes organized by resource: /auth, /modules, /topics, /submissions, /viva, /skill-reports

**Error Handling**:
- notFound middleware catches 404s
- errorHandler catches all errors

**Server Startup**:
- Calls connectDB() to connect MongoDB
- Listens on PORT
- Logs connection status

---

## 📝 Complete Request Flow Examples

### Example 1: User Registration & Login

**Request**: `POST /api/auth/register`
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "password": "SecurePass123",
  "preferredLang": "Hindi"
}
```

**Processing**:
1. Input validation (name length, email format, password min 6)
2. authController.register()
3. Check email not already registered
4. Hash password with bcrypt
5. Create User document in MongoDB
6. Generate JWT token
7. Return token + user data

**Response**:
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "preferredLang": "Hindi",
      "xp": 0,
      "role": "student"
    }
  }
}
```

### Example 2: Learning a Topic

**Step 1**: Get topic
```
GET /api/topics/two-pointers
```

**Step 2**: Translate concept (protected)
```
POST /api/topics/two-pointers/explain
Authorization: Bearer token
{ "language": "Hindi" }
```
→ Sarvam translates English concept to Hindi

**Step 3**: Generate audio (protected)
```
POST /api/topics/two-pointers/speak
Authorization: Bearer token
{ "text": "[Hindi translation]", "language": "Hindi" }
```
→ Sarvam generates audio, returns base64

**Step 4**: Validate quiz (protected)
```
POST /api/topics/two-pointers/validate
Authorization: Bearer token
{ "answer": "Option A" }
```
→ If correct: adds topic to unlockedTopics

### Example 3: Complete Submission Lifecycle

**Step 1**: Submit code (protected)
```
POST /api/submissions
Authorization: Bearer token
{
  "topicId": "507f1f77bcf86cd799439011",
  "code": "def twoPointer(arr):\n  ...",
  "language": "python"
}
```
→ submissionController.submitCodeHandler()
→ judge0Service.submitCode()
→ Judge0 returns token
→ Loop: getResult() every 1s
→ When complete: update Submission, award XP

**Response**:
```json
{
  "success": true,
  "message": "Code executed successfully.",
  "data": {
    "submission": {
      "_id": "...",
      "status": "accepted",
      "testsPassed": 5,
      "testsTotal": 5,
      "score": 100,
      "isAccepted": true
    }
  }
}
```

### Example 4: Viva Voce Session

**Step 1**: Start viva (protected)
```
POST /api/viva/start
Authorization: Bearer token
{ "submissionId": "..." }
```
→ vivaController.startVivaSession()
→ geminiService.startViva(code, topicTitle, language)
→ Gemini generates Q1
→ Create Viva document
→ Return viva with firstQuestion

**Step 2**: Submit answer (protected)
```
POST /api/viva/{vivaId}/answer
Authorization: Bearer token
{ "answer": "I used two pointers..." }
```
→ vivaController.submitAnswer()
→ geminiService.evaluateAnswer(code, Q, answer, topic)
→ Gemini returns: score, feedback, nextQuestion
→ Add to messages array
→ If 3 questions asked: complete viva, calculate totalScore

**Step 3**: Get certificate (protected)
```
POST /api/skill-reports
Authorization: Bearer token
{
  "submissionId": "...",
  "vivaId": "...",
  "topicId": "..."
}
```
→ skillReportController.generateReport()
→ Create SkillReport (calculates weighted score)
→ Return certificateId
→ Public: `/verify/SR-abc123xyz`

---

## 🔄 Data Flow Diagrams

### Authentication Data Flow
```
Client              Backend             Database
  │                   │                    │
  ├─ Register ──────>│                    │
  │                   ├─ Validate input
  │                   ├─ Hash password
  │                   ├─ Create User ────>│
  │                   │                    ├─ Store
  │                   │<─ User created ────┤
  │                   ├─ Generate JWT
  │<─ Token,user ─────┤
  │                   │
  ├─ API request      │
  │ + Token           │
  │                   ├─ Verify JWT
  │                   ├─ Decode ID
  │                   ├─ Lookup User ────>│
  │                   │                    ├─ Query
  │                   │<─ User data ───────┤
  │                   ├─ Process request
  │<─ Response ───────┤
```

---

## 🎯 Summary

Each file plays a specific role in the MVC architecture:

- **Models**: Define data structure and validation
- **Controllers**: Handle requests and coordinate services
- **Services**: Integrate external APIs
- **Middleware**: Process requests/responses
- **Utils**: Provide reusable functions
- **server.js**: Ties everything together

The flow is: **Request → Route → Controller → Model/Service → Response**

Every response is standardized, every error is handled consistently, and the code is organized for scalability.
