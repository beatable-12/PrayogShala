# PrayogShala Backend Architecture

## 🏗️ Overview

PrayogShala Backend is built using the **MVC (Model-View-Controller)** pattern with **Clean Architecture** principles. It provides a complete learning platform for Data Structures & Algorithms with AI-powered assessment, multi-language support, and code execution.

## 📐 Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│           CLIENT LAYER (React Frontend)                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────┐
│         ROUTE LAYER (Express Routes)                     │
│    - Input validation (express-validator)               │
│    - Rate limiting                                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│     CONTROLLER LAYER (Business Logic)                   │
│  - Request handling                                      │
│  - Response formatting                                   │
│  - Orchestration of services                             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│      SERVICE LAYER (External Integrations)              │
│  - Judge0: Code execution                                │
│  - Gemini: AI viva questions                             │
│  - Sarvam: Translation & TTS                             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│      MODEL LAYER (Data Persistence)                      │
│  - Mongoose schemas                                       │
│  - Data validation                                        │
│  - Business rules (hooks)                                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│       DATABASE LAYER (MongoDB Atlas)                    │
│  - Collections: Users, Topics, Modules, etc.            │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Design Patterns

### 1. MVC Pattern

**Model**: Mongoose schemas with validation and business logic
```javascript
// models/User.js
- Defines data structure
- Implements pre-save hooks (password hashing)
- Implements instance methods (matchPassword)
- Enforces validation rules
```

**View**: JSON API responses (no template rendering)
```javascript
// controllers return structured JSON
{ success: true, message: "...", data: {...} }
```

**Controller**: Request handlers with business orchestration
```javascript
// controllers/authController.js
- Parse request body
- Call models/services
- Format response
- Handle errors
```

### 2. Service Layer Pattern

**External API Integration**: Judge0, Gemini, Sarvam
```javascript
services/
├── judge0Service.js     → Code execution sandbox
├── geminiService.js     → AI viva generation & evaluation
└── sarvamService.js     → Translation & text-to-speech
```

Each service:
- Wraps external API calls
- Handles authentication headers
- Normalizes response data
- Translates errors to application errors

### 3. Middleware Pipeline

```
Request
  ↓
Security (Helmet, CORS)
  ↓
Parsing (JSON, URL-encoded)
  ↓
Logging (Morgan)
  ↓
Rate Limiting (express-rate-limit)
  ↓
Route Handler
  ↓
Input Validation (express-validator)
  ↓
Authentication (JWT verify)
  ↓
Authorization (role check)
  ↓
Controller Logic
  ↓
Response
  ↓
Error Middleware
```

### 4. Dependency Injection Pattern

Controllers receive dependencies via imports (module-level DI):
```javascript
import User from '../models/User.js';
import { submitCode } from '../services/judge0Service.js';
```

This keeps code testable and loosely coupled.

### 5. Error Handling Pattern

```javascript
// Unified error handling
try {
  await someAsyncOp();
} catch (error) {
  // Caught by errorHandler middleware
  throw error;  // Next(error)
}

// The errorHandler middleware:
// 1. Detects error type (Mongoose, JWT, etc.)
// 2. Normalizes to user-friendly message
// 3. Returns consistent error response
// 4. Only exposes stack traces in development
```

## 🔐 Authentication & Authorization Flow

### Authentication Flow (JWT)

```
Client                          Server
  │                               │
  ├─ POST /auth/register ────────>│
  │                               ├─ Validate input
  │                               ├─ Hash password (bcrypt)
  │                               ├─ Create User document
  │                               ├─ Generate JWT token
  │<──── { token, user } ─────────┤
  │                               │
  ├─ GET /auth/me                 │
  │  + Authorization: Bearer {token}
  │                               ├─ Verify JWT signature
  │                               ├─ Lookup User by ID
  │<─ { user profile } ───────────┤
```

### Protected Route Access

```javascript
// Route definition
app.get('/api/submissions', protect, getSubmissions);
            ↑
            └─ Middleware checks JWT

// protect middleware
1. Extract token from Authorization header
2. Verify JWT signature with JWT_SECRET
3. Decode to get user ID
4. Lookup user in DB
5. Attach user object to req.user
6. Call next()
```

### Admin-Only Route Access

```javascript
app.post('/api/modules', protect, adminOnly, createModule);
          ↑              ↑         ↑
          │              │         └─ Check req.user.role === 'admin'
          │              └─ Check JWT
          └─ Validate input

// Flow:
1. protect middleware verifies JWT → attaches req.user
2. adminOnly checks req.user.role
3. If not admin → return 403 Forbidden
4. If admin → proceed to createModule
```

## 🗄️ Data Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│  ┌────────┐ │
│  │ _id    │ │
│  │ email  │ │
│  │ xp     │ │
│  └────────┘ │
│ unlockedTopics [ref Topic]
│ completedTopics [ref Topic]
└─────────────┘
      │
      ├──1:N──→ ┌─────────────────┐
      │         │   Submission    │
      │         │  ┌───────────┐  │
      │         │  │ _id       │  │
      │         │  │ user [FK] │  │
      │         │  │ topic [FK]│  │
      │         │  │ code      │  │
      │         │  │ status    │  │
      │         │  └───────────┘  │
      │         └─────────────────┘
      │              │
      │              ├──1:1──→ ┌──────────────┐
      │              │         │    Viva      │
      │              │         │  ┌────────┐  │
      │              │         │  │ _id    │  │
      │              │         │  │ user   │  │
      │              │         │  │ status │  │
      │              │         │  └────────┘  │
      │              │         └──────────────┘
      │              │              │
      │              └──1:1─────────┴──→ ┌──────────────┐
      │                                   │ SkillReport  │
      │                                   │  ┌────────┐  │
      │                                   │  │ certID │  │
      │                                   │  │ score  │  │
      │                                   │  └────────┘  │
      │                                   └──────────────┘
      │
      └─────→ ┌─────────────────┐
              │    Module       │
              │  ┌───────────┐  │
              │  │ _id       │  │
              │  │ title     │  │
              │  │ topics[]  │  │
              │  └───────────┘  │
              └─────────────────┘
                      │
                      └──1:N──→ ┌───────────────┐
                                │    Topic      │
                                │  ┌─────────┐  │
                                │  │ _id     │  │
                                │  │ module  │  │
                                │  │ quiz    │  │
                                │  │ project │  │
                                │  └─────────┘  │
                                └───────────────┘
```

### Data Flow Example: Completing a Topic

```
┌──────────────────────────────────────────────────────────┐
│ Student solves a DSA topic step-by-step                  │
└────────────────────┬─────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  Step 1: Learn Concept  │
        │  GET /topics/:slug      │
        │  └─ Receives conceptText
        │                         │
        │  POST /topics/:slug/explain
        │  └─ Sarvam translates to Hindi
        │                         │
        │  POST /topics/:slug/speak
        │  └─ Sarvam generates TTS
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Step 2: Validate Concept
        │  POST /topics/:slug/validate
        │  └─ Check quiz answer
        │  └─ If correct: unlock project
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Step 3: Code Project   │
        │  POST /submissions      │
        │  └─ Submit code to Judge0
        │  └─ Get test results
        │  └─ If all pass: isAccepted = true
        │  └─ Award XP points
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Step 4: Viva Interview │
        │  POST /viva/start       │
        │  └─ Gemini reads code
        │  └─ Generates Q1
        │                         │
        │  POST /viva/:id/answer  │ (3+ questions)
        │  └─ Student answers
        │  └─ Gemini scores & asks next Q
        │                         │
        │  Viva completes after max 3 rounds
        │  Status: 'completed'
        │  Score: Average of all answers
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Step 5: Issue Certificate
        │  POST /skill-reports    │
        │  └─ Calculate:
        │    - Quiz score: 20%
        │    - Code score: 40%
        │    - Viva score: 40%
        │  └─ Generate certificateId
        │  └─ Mark isVerified = true
        │  └─ Create public credential
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Certificate issued!    │
        │  Public URL:            │
        │  /verify/SR-abc123xyz   │
        └────────────────────────┘
```

## 🔄 Request-Response Cycle

### Example: Submit Code

**Request**:
```javascript
POST /api/submissions
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "topicId": "507f1f77bcf86cd799439011",
  "code": "def solve(arr):\n    return sorted(arr)",
  "language": "python"
}
```

**Request Processing**:
```
1. Helmet + CORS middleware → Allow request
2. express.json() → Parse JSON body
3. Rate limiter → Allow (not exceeded)
4. protect middleware → Verify JWT, attach req.user
5. Route handler → submitCodeHandler()
6. Input validation → Check required fields
7. Database lookup → Find Topic by ID
8. Service call → judge0Service.submitCode()
9. Test execution → Run against test cases
10. Model update → Create Submission document
11. Response → Return submission record
12. Error handler → (No errors, skip)
```

**Response**:
```javascript
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Code executed successfully.",
  "data": {
    "submission": {
      "_id": "507f1f77bcf86cd799439013",
      "user": "507f1f77bcf86cd799439001",
      "topic": "507f1f77bcf86cd799439011",
      "code": "def solve(arr):\n    return sorted(arr)",
      "language": "python",
      "status": "accepted",
      "testsPassed": 3,
      "testsTotal": 3,
      "score": 100,
      "isAccepted": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

## 🛡️ Security Considerations

### Password Security
- Bcrypt hashing with salt factor 12
- Pre-save hook automatically hashes before storing
- `select: false` on password field (never returned by default)
- Instance method `matchPassword()` for comparison

### JWT Security
- Token contains only user ID (minimal payload)
- Signed with JWT_SECRET (32+ chars required)
- 7-day expiry (configurable via JWT_EXPIRES_IN)
- Verified on every protected route
- No sensitive data stored in token (client can decode)

### Input Validation
- express-validator on all public endpoints
- Sanitization (trim, normalize email, etc.)
- Type checking (email, URL, length)
- Returns 422 with detailed field errors

### Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents brute force attacks
- Returns 429 Too Many Requests

### CORS
- Configurable via CLIENT_URL env var
- Prevents cross-origin attacks
- Credentials supported for cookies/auth headers

## 📊 Code Execution Flow (Judge0 Integration)

```
Student                  Backend             Judge0 API
  │                         │                     │
  ├─ Submit code ──────────>│                     │
  │                         ├─ Create Submission
  │                         ├─ submitCode() ────>│
  │                         │<─ token ──────────┤
  │                         │                     │
  │                    [polling loop: max 10]    │
  │                         ├─ Wait 1s
  │                         ├─ getResult() ────>│
  │                         │<─ status=pending──┤
  │                         │ (retry)             │
  │                         ├─ getResult() ────>│
  │                         │<─ stdout,stderr───┤
  │                         │                     │
  │                         ├─ Update Submission
  │                         ├─ Calculate score
  │                         ├─ Award XP
  │<─ Result ────────────────┤
  │                         │
```

## 🎨 Response Shape Standards

### Success Response
```javascript
{
  success: true,
  message: "Human-readable success message",
  data: {
    // Actual response data
    submission: {...},
    user: {...},
    etc.
  }
}
```

### Validation Error
```javascript
{
  success: false,
  message: "Validation failed.",
  errors: [
    { field: "email", message: "Please enter a valid email" },
    { field: "password", message: "Password must be at least 6 characters" }
  ]
}
```

### Not Found Error
```javascript
{
  success: false,
  message: "Topic not found."
}
```

### Mongoose Validation Error
```javascript
{
  success: false,
  message: "Name must be at least 2 characters, Email is required."
}
```

## 🔌 External API Integration

### Judge0 (Code Execution)
- **Endpoint**: https://judge0-ce.p.rapidapi.com
- **Auth**: RapidAPI headers
- **Format**: Base64 encoded code + stdin
- **Response**: Token for polling
- **Status Poll**: Every 1s until completion (max 10 retries)

### Gemini (AI Viva)
- **Endpoint**: generativelanguage.googleapis.com/v1beta
- **Auth**: API key in query string
- **Format**: System instruction + user prompt
- **Response Type**: JSON (enforced via generationConfig)
- **Model**: gemini-1.5-flash (fast, low cost)

### Sarvam (Translation & TTS)
- **Translate**: English concept → 7 Indian languages
- **TTS**: Text → Base64 audio (8kHz WAV)
- **Languages**: Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, English
- **Response**: Base64 encoded audio for browser playback

## 📈 Scalability Considerations

### Current Design
- Single-server Express app
- MongoDB as primary data store
- External APIs for heavy computation

### For Production Scale

**Horizontal Scaling**:
```
Load Balancer
  │
  ├─ Server 1
  ├─ Server 2
  └─ Server 3
  ↓
Shared MongoDB
Shared Redis (sessions)
```

**Caching Layer**:
- Redis for session management
- Cache Sarvam translations
- Cache topic content (TTL 1 hour)

**Message Queue**:
- Bull/RabbitMQ for async tasks
- Viva session cleanup
- Report generation
- Email notifications

**CDN**:
- Static assets
- Base64 audio files
- Cached translations

## 🧪 Testing Strategy

### Unit Tests
- Controller logic (mock models/services)
- Service integration (mock external APIs)
- Utility functions (generateToken, etc.)

### Integration Tests
- Auth flow (register, login, protected routes)
- Complete submission flow
- Viva session lifecycle

### End-to-End Tests
- Full user journey through platform
- Error scenarios and edge cases

## 📚 Key Files Explained

| File | Purpose |
|------|---------|
| `server.js` | Express app initialization, route registration, middleware setup |
| `config/db.js` | MongoDB connection with error handling |
| `models/*.js` | Mongoose schemas with validation and hooks |
| `controllers/*.js` | Request handlers, business logic orchestration |
| `middleware/*.js` | Request/response middleware (auth, validation, error) |
| `services/*.js` | External API integration (Judge0, Gemini, Sarvam) |
| `utils/*.js` | Reusable utilities (token generation, response formatting) |

## 🚀 Performance Optimization

1. **Database Indexing**
   - Unique index on User.email
   - Compound index on Submission(user, topic)

2. **Response Selection**
   - Exclude password by default
   - Hide correct quiz answers from students
   - Hide hidden test cases from responses

3. **Async Operations**
   - Judge0 calls are async with polling
   - Gemini calls are async
   - Submission processing doesn't block response

4. **Caching Opportunities**
   - Module/Topic lists (rarely change)
   - User's completed topics (could use Redis)
   - Translation results (same concept, same language)
