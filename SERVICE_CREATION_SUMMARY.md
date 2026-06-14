# Service Architecture Summary - PrayogShala

## ✅ Completed Service Skeletons (10 Services)

### 1. **authService.ts** ✓
- User authentication (login, register, logout)
- Profile management
- Token refresh and password reset flows
- **TODOs**: MongoDB, JWT refresh, email verification

### 2. **moduleService.ts** ✓
- CRUD operations for learning modules
- Pagination and filtering
- User progress tracking
- Module search functionality
- **TODOs**: MongoDB, caching, analytics

### 3. **topicService.ts** ✓
- CRUD operations for topics
- Concept explanations with Sarvam AI
- Text-to-speech integration
- Quiz validation
- Learning hints system
- **TODOs**: Sarvam API integration, caching, fuzzy matching

### 4. **projectService.ts** ✓
- Project generation with Gemini AI
- Milestone generation
- Code suggestions
- Project lifecycle management
- **TODOs**: Gemini API, validation, tracking

### 5. **submissionService.ts** ✓
- Code submission handling
- Judge0 polling with exponential backoff
- Execution result aggregation
- Latest/best submission tracking
- Code snapshot management
- **TODOs**: Judge0 API, timeout handling, aggregation

### 6. **judge0Service.ts** ✓
- Judge0 API wrapper for code execution
- Language ID mapping
- Execution status polling
- Status code mapping to SubmissionStatus
- **TODOs**: Judge0 API, polling logic, rate limiting

### 7. **sarvamService.ts** ✓
- Code analysis (algorithms, data structures, complexity)
- Multi-language translation
- Text-to-speech generation
- Language detection
- Batch operations support
- **TODOs**: Sarvam API, caching, batch processing

### 8. **geminiService.ts** ✓
- Project generation from topic concepts
- Milestone creation
- Viva question generation
- Answer evaluation and scoring
- Summary/feedback generation
- Prompt engineering utilities
- **TODOs**: Gemini API, context management, cost tracking

### 9. **vivaService.ts** ✓
- Viva session management
- Question generation and answer submission
- Code analysis for viva
- Session resumption
- Viva abandonment handling
- **TODOs**: Gemini & Sarvam integration, context management

### 10. **skillReportService.ts** ✓
- Skill report generation
- Score aggregation (Quiz 20%, Code 40%, Viva 40%)
- Certificate management
- Social media sharing
- User skill profile aggregation
- **TODOs**: MongoDB, PDF generation, email notifications

## Infrastructure

### **apiClient.ts** ✓
- Centralized HTTP client using Fetch API
- Token management (get, set, clear)
- Request/response handling
- Error handling with `PrayogShalaError`
- Support for GET, POST, PUT, DELETE, PATCH

### **index.ts** ✓
- Central export point for all services
- Config exports (API, Judge0, Sarvam, Gemini)

## Type Safety & Integration

- ✓ All services use TypeScript interfaces from `src/types/`
- ✓ No `any` types - fully type-safe
- ✓ Union types for flexible references
- ✓ Request/response types defined
- ✓ Error handling with custom `PrayogShalaError`

## File Structure

```
src/services/
├── apiClient.ts          ✓ HTTP client
├── authService.ts        ✓ Authentication
├── moduleService.ts      ✓ Modules
├── topicService.ts       ✓ Topics
├── projectService.ts     ✓ Projects
├── submissionService.ts  ✓ Submissions
├── judge0Service.ts      ✓ Judge0 API
├── sarvamService.ts      ✓ Sarvam AI
├── geminiService.ts      ✓ Gemini AI
├── vivaService.ts        ✓ Viva Sessions
├── skillReportService.ts ✓ Skill Reports
└── index.ts              ✓ Central exports
```

## TODO Markers Placed

**Total TODOs: 60+** across all services for:
- ✓ API integrations (MongoDB, Judge0, Sarvam, Gemini)
- ✓ Caching strategies
- ✓ Error handling
- ✓ Validation logic
- ✓ Response parsing
- ✓ Rate limiting
- ✓ Request deduplication
- ✓ Polling mechanisms
- ✓ Timeout handling
- ✓ Email notifications

## Key Features

### Authentication Flow
- Login/Register with JWT tokens
- Automatic token injection in requests
- Token refresh logic
- Session management
- Password reset flow

### Learning Flow
1. Discover modules and topics
2. Learn concepts (with multilingual support)
3. Generate AI projects
4. Submit and execute code (Judge0)
5. Participate in AI viva (Gemini)
6. Earn skill certificates

### Code Execution
- Submit code in Python, JavaScript, Java, C++, C
- Judge0 polling with exponential backoff (1s - 5s)
- Max 30 retry attempts
- Test case evaluation
- Status tracking

### AI Integration
- **Sarvam**: Code analysis, translation, TTS
- **Gemini**: Content generation, evaluation, feedback

### Certification
- Weighted scoring (20% quiz, 40% code, 40% viva)
- PDF certificate generation
- Social media sharing
- Skill profile building

## Next Steps

1. **Backend Setup**: Connect MongoDB, Judge0, Sarvam, Gemini APIs
2. **Implementation**: Replace TODO comments with actual API calls
3. **Testing**: Write unit tests for service methods
4. **Integration**: Connect services to React components
5. **Error Handling**: Implement retry logic and fallbacks

## Notes

- All services are stateless and can be called from any component
- Services use centralized apiClient for HTTP requests
- All responses are type-safe with TypeScript
- Error handling is consistent across all services
- No real API integration yet - ready for backend connection
