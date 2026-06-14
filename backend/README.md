# PrayogShala Backend API

A complete Node.js/Express backend for PrayogShala - a platform for learning data structures and algorithms with AI-powered code evaluation, multi-language translation, and live interviews.

## 📋 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB Atlas connection
├── controllers/
│   ├── authController.js     # User authentication (register, login, profile)
│   ├── moduleController.js   # Curriculum modules (CRUD)
│   ├── topicController.js    # DSA topics, translations, TTS
│   ├── submissionController.js # Code submissions to Judge0
│   ├── vivaController.js     # AI-powered viva sessions
│   └── skillReportController.js # Digital credentials & certificates
├── models/
│   ├── User.js               # User schema with bcrypt hashing
│   ├── Module.js             # Curriculum module schema
│   ├── Topic.js              # DSA topic with validation quiz
│   ├── Submission.js         # Code submission records
│   ├── Viva.js               # AI viva voce sessions
│   └── SkillReport.js        # Certificate/credential schema
├── middleware/
│   ├── authMiddleware.js     # JWT verification & admin check
│   ├── errorMiddleware.js    # Global error handling
│   └── validateMiddleware.js # Express-validator integration
├── services/
│   ├── judge0Service.js      # Code execution sandbox integration
│   ├── geminiService.js      # Google Gemini AI for viva questions
│   └── sarvamService.js      # Sarvam AI for translation & TTS
├── utils/
│   ├── asyncHandler.js       # Express async wrapper
│   ├── apiResponse.js        # Standardized JSON responses
│   └── generateToken.js      # JWT token generation
├── server.js                 # Main Express app & routes
├── package.json              # Dependencies
└── .env.example              # Environment template
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- API keys for:
  - Google Gemini (for AI viva)
  - Sarvam AI (for translation & TTS)
  - Judge0 (for code execution)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/prayogshala
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRES_IN=7d
SARVAM_API_KEY=your_sarvam_key
GEMINI_API_KEY=your_gemini_key
JUDGE0_API_KEY=your_judge0_key
CLIENT_URL=http://localhost:3000
```

### Running the Server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server will be available at `http://localhost:5000`

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Login and receive JWT
- `GET /me` - Get current user profile (protected)
- `PATCH /me` - Update profile (protected)

### Modules (`/api/modules`)
- `GET /` - List all published modules
- `GET /:id` - Get module with topics
- `POST /` - Create module (admin only)
- `PUT /:id` - Update module (admin only)
- `DELETE /:id` - Delete module (admin only)

### Topics (`/api/topics`)
- `GET /` - List all published topics
- `GET /:slug` - Get full topic details
- `POST /:slug/explain` - Translate concept to user's language (protected)
- `POST /:slug/speak` - Generate TTS audio (protected)
- `POST /:slug/validate` - Validate quiz answer (protected)
- `POST /` - Create topic (admin only)
- `PUT /:id` - Update topic (admin only)
- `DELETE /:id` - Delete topic (admin only)

### Code Submissions (`/api/submissions`)
- `POST /` - Submit code to Judge0 (protected)
- `GET /` - Get user's submission history (protected)
- `GET /:id` - Get single submission (protected)
- `GET /:id/poll` - Poll Judge0 status (protected)

### Viva Voce (`/api/viva`)
- `POST /start` - Begin AI viva session (protected)
- `POST /:id/answer` - Submit viva answer (protected)
- `PATCH /:id/complete` - Finish viva (protected)
- `GET /` - List user's viva sessions (protected)
- `GET /:id` - Get specific viva (protected)

### Skill Reports (`/api/skill-reports`)
- `POST /` - Generate certificate (protected)
- `GET /` - List user's certificates (protected)
- `GET /:id` - View certificate details (protected)
- `GET /verify/:certificateId` - Public certificate verification
- `GET /admin/all` - Admin: View all certificates

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth with 7-day expiry
- **Password Hashing**: bcryptjs with salt factor 12
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet.js**: HTTP security headers
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Express-validator on all inputs
- **Error Handling**: Centralized error middleware with Mongoose translation

## 📊 Database Schema

### User Schema
```javascript
{
  name: String,           // User's full name
  email: String,          // Unique, lowercased
  password: String,       // Hashed with bcrypt
  role: 'student' | 'admin',
  preferredLang: String,  // For Sarvam translations
  xp: Number,             // Experience points
  unlockedTopics: [ObjectId],
  completedTopics: [ObjectId],
  timestamps: true
}
```

### Topic Schema
```javascript
{
  module: ObjectId,
  title: String,
  slug: String,           // URL-friendly identifier
  conceptText: String,    // English concept explanation
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  xpReward: Number,
  validationQuiz: {
    question: String,
    options: [String],
    correctAnswer: String,
    type: 'mcq' | 'code-fill' | 'true-false'
  },
  projectTemplate: {
    title: String,
    starterCode: String,
    language: 'python' | 'javascript' | 'java' | 'cpp',
    testCases: [{input, expectedOutput, isHidden}]
  }
}
```

### Submission Schema
```javascript
{
  user: ObjectId,
  topic: ObjectId,
  code: String,
  language: String,
  judge0Token: String,
  status: 'pending' | 'accepted' | 'wrong_answer' | 'compilation_error' | ...,
  stdout: String,
  stderr: String,
  testsPassed: Number,
  testsTotal: Number,
  score: Number,          // Auto-computed percentage
  isAccepted: Boolean
}
```

### Viva Schema
```javascript
{
  user: ObjectId,
  submission: ObjectId,
  topic: ObjectId,
  messages: [{
    role: 'gemini' | 'student',
    content: String,
    score: Number,        // 0-10 for student answers
    timestamp: Date
  }],
  totalScore: Number,     // Average of all answer scores
  feedback: String,       // Gemini's summary
  status: 'in_progress' | 'completed' | 'abandoned',
  isPassed: Boolean       // totalScore >= 60
}
```

### SkillReport Schema
```javascript
{
  user: ObjectId,
  topic: ObjectId,
  submission: ObjectId,
  viva: ObjectId,
  overallScore: Number,   // Weighted: Quiz 20%, Code 40%, Viva 40%
  breakdown: {
    conceptValidation: Number,  // Quiz score
    codeExecution: Number,      // Test pass %
    vivaScore: Number           // Viva performance
  },
  certificateId: String,  // Unique public ID for verification
  languageUsed: String,
  isVerified: Boolean,
  issuedAt: Date
}
```

## 🔧 Middleware Explained

### `authMiddleware.js`
- **protect**: Verifies JWT from `Authorization: Bearer <token>` header
- **adminOnly**: Restricts route access to admin-role users
- Attaches `req.user` to request for downstream controllers

### `errorMiddleware.js`
- **notFound**: Catches 404 routes
- **errorHandler**: Translates Mongoose validation/cast errors to readable messages
- Dev mode exposes full stack traces; production shows user-friendly errors

### `validateMiddleware.js`
- **validateRequest**: Reads express-validator chain results
- Returns 422 with field-level error objects if validation fails

## 🤖 AI Service Integration

### Judge0 Service
- **submitCode()**: Sends code to sandbox, returns token
- **getResult()**: Polls execution result by token
- **runAndWait()**: Submit + poll loop with 10 retries
- Supports Python, JavaScript, Java, C++

### Gemini Service
- **startViva()**: Generates first question from submitted code
- **evaluateAnswer()**: Scores answer (0-10) and suggests next question
- **generateFinalFeedback()**: Summarizes overall viva performance

### Sarvam Service
- **translateText()**: English concept → 7 Indian languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi)
- **textToSpeech()**: Generates audio for translated text
- Female voice, formal mode, preprocessing enabled

## 📝 Usage Examples

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "password": "secure123",
    "preferredLang": "Hindi"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "raj@example.com",
    "password": "secure123"
  }'
# Returns: { token, user }
```

### Submit Code
```bash
curl -X POST http://localhost:5000/api/submissions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "507f1f77bcf86cd799439011",
    "code": "def solution(arr):\n    return sorted(arr)",
    "language": "python"
  }'
```

### Start Viva Session
```bash
curl -X POST http://localhost:5000/api/viva/start \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "507f1f77bcf86cd799439012"
  }'
# Gemini generates first question based on code
```

### Translate Topic Concept
```bash
curl -X POST http://localhost:5000/api/topics/two-pointers/explain \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "Hindi"
  }'
# Sarvam translates English concept to Hindi
```

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get All Modules
```bash
curl http://localhost:5000/api/modules
```

### Get Topic by Slug (No Auth)
```bash
curl http://localhost:5000/api/topics/arrays-hashing
```

## 📋 Response Format

All API responses follow a consistent structure:

**Success Response (2xx)**:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { /* response data */ }
}
```

**Error Response (4xx, 5xx)**:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

## 🐛 Debugging

Enable detailed logging by setting:
```env
NODE_ENV=development
```

In development mode:
- Full error stack traces returned
- Morgan HTTP request logging enabled
- Mongoose debug queries available

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **cors**: Cross-origin requests
- **helmet**: Security headers
- **morgan**: HTTP logging
- **express-rate-limit**: Rate limiting
- **dotenv**: Environment variables
- **node-fetch**: API calls to external services

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update all API keys in `.env`
- [ ] Verify MongoDB Atlas IP whitelist
- [ ] Enable HTTPS
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Configure CLIENT_URL for production domain
- [ ] Enable rate limiting (already configured)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Backup MongoDB regularly
- [ ] Monitor API logs and performance

## 📞 Support

For issues or questions about the backend:
1. Check logs: `tail -f server.log`
2. Verify `.env` configuration
3. Test endpoints with curl or Postman
4. Check MongoDB Atlas connection status

## 📄 License

MIT License - See LICENSE file for details
