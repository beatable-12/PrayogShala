/**
 * src/utils/aiArchitecture.ts
 * 
 * Comprehensive AI service architecture documentation for PrayogShala
 * 
 * This file documents the complete AI integration architecture including:
 * - Sarvam AI responsibilities and integration points
 * - Gemini AI responsibilities and integration points
 * - Judge0 responsibilities and integration points
 * - Request/response contracts for all services
 * - Backend TODO markers for API implementation
 * - Data flow diagrams and architecture patterns
 */

// ============= AI SERVICE ARCHITECTURE OVERVIEW =============

export const AI_SERVICE_ARCHITECTURE = {
  overview: `
    PrayogShala uses three AI services with distinct responsibilities:
    
    1. SARVAM AI - Code Intelligence & Analysis
       - Concept explanations for topics
       - Hint generation for stuck students
       - Code reviews and improvements
       - Detailed algorithm/data structure analysis
       - Viva question generation from code
       - Viva answer evaluation and scoring
       - Translation services (multilingual support)
       - Text-to-speech for accessibility
    
    2. GEMINI AI - Content Generation
       - Project generation from topic concepts
       - Milestone breakdown for projects
       - Subtask generation
       - Starter code templates
       - Test case generation
    
    3. JUDGE0 - Code Execution & Testing
       - Code submission and compilation
       - Runtime execution monitoring
       - Memory usage tracking
       - Test case evaluation (pass/fail)
       - Performance metrics collection
       - Error reporting and diagnostics
  `,

  serviceResponsibilities: {
    sarvamAI: {
      name: 'Sarvam AI Service',
      file: 'src/services/sarvamService.ts',
      apiEndpoint: 'https://api.sarvam.ai/v1',
      responsibilities: [
        {
          id: 1,
          title: 'Concept Explanations',
          description: 'Generate clear explanations for programming concepts',
          method: 'generateConceptExplanation(topicTitle, conceptText, difficulty, language)',
          endpoint: 'POST /api/ai/concepts/explain',
          requestType: 'ConceptExplanationRequest',
          responseType: 'ConceptExplanation',
          todoMarkers: [
            'TODO: Call Sarvam AI endpoint for concept explanation',
            'TODO: Format response with examples and related concepts',
            'TODO: Implement caching based on topic + concept pair',
            'TODO: Add support for multiple difficulty levels',
          ],
          backendIntegration: `
            Backend should:
            1. Receive request from frontend
            2. Call Sarvam AI API with prompt engineering
            3. Cache results for repeated concepts
            4. Return structured response to frontend
          `,
        },
        {
          id: 2,
          title: 'Hint Generation',
          description: 'Generate progressive hints to help stuck students',
          method: 'generateHint(topicTitle, problemDescription, hintNumber, submittedCode, language)',
          endpoint: 'POST /api/ai/hints/generate',
          requestType: 'HintGenerationRequest',
          responseType: 'HintResponse',
          todoMarkers: [
            'TODO: Call Sarvam AI endpoint for hint generation',
            'TODO: Ensure hints are progressive (easier hints first)',
            'TODO: Avoid revealing solutions directly',
            'TODO: Store hint history to avoid repetition',
            'TODO: Track hint effectiveness for analytics',
          ],
          hints: {
            progressive: 'Hint 1 (easiest) → Hint 2 → Hint 3 (hardest)',
            strategy: 'Guide towards solution without giving away answer',
            storage: 'Track which hints student has received',
          },
        },
        {
          id: 3,
          title: 'Code Review',
          description: 'Review submitted code for issues and improvements',
          method: 'reviewCode(code, language, topicTitle, submittedCode)',
          endpoint: 'POST /api/ai/code/review',
          requestType: 'CodeReviewRequest',
          responseType: 'CodeReviewResponse',
          todoMarkers: [
            'TODO: Call Sarvam AI endpoint for code review',
            'TODO: Categorize issues by severity (error, warning, info)',
            'TODO: Provide specific line numbers for issues',
            'TODO: Include constructive suggestions for improvement',
            'TODO: Store review history for student progress tracking',
          ],
          issueLevels: {
            error: 'Critical issues affecting functionality',
            warning: 'Issues that could cause problems',
            info: 'Best practice suggestions and style improvements',
          },
        },
        {
          id: 4,
          title: 'Code Analysis',
          description: 'Detailed analysis of algorithms and complexity',
          method: 'analyzeCode(code, language)',
          endpoint: 'POST /api/ai/code/analyze',
          requestType: 'CodeAnalysisRequest',
          responseType: 'SarvamCodeAnalysis',
          todoMarkers: [
            'TODO: Call Sarvam AI endpoint for code analysis',
            'TODO: Identify algorithms and data structures used',
            'TODO: Calculate time and space complexity',
            'TODO: Identify potential optimizations',
            'TODO: Store analysis for comparison across submissions',
          ],
          analyticsTracking: [
            'Time complexity patterns',
            'Data structure usage frequency',
            'Optimization opportunities missed',
            'Progress in code efficiency',
          ],
        },
        {
          id: 5,
          title: 'Viva Question Generation',
          description: 'Generate viva questions based on submitted code',
          method: 'generateVivaQuestion(topicTitle, submittedCode, language, previousQuestions, difficulty)',
          endpoint: 'POST /api/ai/viva/questions',
          requestType: 'VivaQuestionGenerationRequest',
          responseType: 'VivaQuestionResponse',
          todoMarkers: [
            'TODO: Call Sarvam AI endpoint for viva question generation',
            'TODO: Generate questions about implementation details',
            'TODO: Avoid questions already asked (track history)',
            'TODO: Adjust difficulty based on student submission quality',
            'TODO: Categorize questions (concept, implementation, optimization, edge_cases)',
          ],
          questionCategories: [
            'concept - theoretical understanding',
            'implementation - how the solution works',
            'optimization - performance improvements',
            'edge_cases - boundary condition handling',
          ],
        },
        {
          id: 6,
          title: 'Viva Evaluation',
          description: 'Evaluate student responses during viva sessions',
          method: 'evaluateVivaAnswer(question, studentAnswer, submittedCode, topicTitle, language)',
          endpoint: 'POST /api/ai/viva/evaluate',
          requestType: 'VivaEvaluationRequest',
          responseType: 'VivaEvaluationResponse',
          todoMarkers: [
            'TODO: Call Sarvam AI endpoint for answer evaluation',
            'TODO: Score responses on a scale (0-10)',
            'TODO: Identify key points covered and missed',
            'TODO: Provide constructive feedback',
            'TODO: Suggest next question based on performance',
            'TODO: Track scoring patterns for consistency',
          ],
          scoringRubric: {
            0: 'No understanding of concept',
            3: 'Partial understanding with significant gaps',
            5: 'Basic understanding but missing details',
            7: 'Good understanding with minor gaps',
            9: 'Excellent understanding with all details',
            10: 'Expert-level understanding with optimizations',
          },
        },
      ],
      additionalMethods: [
        {
          title: 'Translation',
          method: 'translateContent(text, sourceLanguage, targetLanguage)',
          endpoint: 'POST /api/ai/translate',
          purpose: 'Translate concept explanations and problems to student language',
          todoMarkers: [
            'TODO: Connect to Sarvam translation API',
            'TODO: Implement caching for frequently translated content',
            'TODO: Support batch translation for efficiency',
            'TODO: Handle long text splitting for API limits',
          ],
        },
        {
          title: 'Text-to-Speech',
          method: 'textToSpeech(text, language, speed)',
          endpoint: 'POST /api/ai/text-to-speech',
          purpose: 'Generate audio for accessibility and multimodal learning',
          todoMarkers: [
            'TODO: Connect to Sarvam text-to-speech API',
            'TODO: Implement audio caching to avoid redundant API calls',
            'TODO: Support different audio formats and bitrates',
            'TODO: Handle long audio generation with streaming',
          ],
        },
      ],
    },

    geminiAI: {
      name: 'Google Gemini Service',
      file: 'src/services/geminiService.ts',
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
      responsibilities: [
        {
          id: 1,
          title: 'Project Generation',
          description: 'Generate complete coding projects from topic concepts',
          method: 'generateProject(topicTitle, conceptText, difficulty, estimatedMinutes)',
          endpoint: 'POST /api/projects/generate',
          requestType: 'ProjectGenerationRequest',
          responseType: 'GeminiProjectResponse',
          generatedContent: {
            projectTitle: 'Based on topic concept',
            projectDescription: 'Detailed problem statement',
            starterCode: 'Template code for language',
            subtasks: 'Array of 3-6 achievable subtasks',
            testCases: 'Minimum 3 test cases for validation',
          },
          todoMarkers: [
            'TODO: Call Gemini API with structured project generation prompt',
            'TODO: Validate response contains all required fields',
            'TODO: Parse JSON output with error handling',
            'TODO: Ensure test cases are comprehensive and solvable',
            'TODO: Cache generated projects to avoid redundant API calls',
            'TODO: Implement retry logic for API failures',
          ],
          promptEngineering: {
            constraints: [
              'Max 6 subtasks per project',
              'Subtasks must be achievable in estimated time',
              'Minimum 3 test cases covering normal and edge cases',
              'Starter code should compile/run without errors',
            ],
            validation: [
              'Response must be valid JSON',
              'All required fields must be present',
              'Test cases must have matching input/output',
              'Starter code must be in correct syntax',
            ],
          },
        },
        {
          id: 2,
          title: 'Milestone Generation',
          description: 'Break projects into achievable milestones',
          method: 'generateMilestones(projectTitle, projectDescription, numberOfMilestones, difficulty)',
          endpoint: 'POST /api/milestones/generate',
          requestType: 'MilestoneGenerationRequest',
          responseType: 'MilestoneGenerationResponse',
          milestoneBreakdown: {
            ordering: 'Logically ordered from simple to complex',
            distribution: '50-70% required, 30-50% optional',
            timeEstimate: 'Each milestone should take 2-5 days',
            deliverables: 'Clear acceptance criteria for each',
          },
          todoMarkers: [
            'TODO: Call Gemini API for milestone generation',
            'TODO: Ensure milestones are logically ordered',
            'TODO: Make milestones achievable in estimated time',
            'TODO: Include mix of required (50-70%) and optional milestones',
            'TODO: Validate milestone descriptions are clear and actionable',
            'TODO: Implement caching by project ID',
          ],
          exampleMilestones: [
            'Milestone 1: Setup (Required) - 1 day',
            'Milestone 2: Core Feature 1 (Required) - 2 days',
            'Milestone 3: Core Feature 2 (Required) - 2 days',
            'Milestone 4: UI/Polish (Optional) - 2 days',
            'Milestone 5: Advanced Features (Optional) - 3 days',
          ],
        },
      ],
    },

    judge0Service: {
      name: 'Judge0 Execution Service',
      file: 'src/services/judge0Service.ts',
      apiEndpoint: 'https://judge0-ce.p.rapidapi.com',
      responsibilities: [
        {
          id: 1,
          title: 'Code Execution',
          description: 'Execute submitted code on backend servers',
          method: 'submitExecution(code, language, stdin, expectedOutput)',
          endpoint: 'POST /api/submissions/execute',
          executionFlow: [
            '1. Validate code syntax and size',
            '2. Submit to Judge0 API',
            '3. Receive execution token',
            '4. Begin polling for results',
          ],
          todoMarkers: [
            'TODO: Call Judge0 API: POST /submissions',
            'TODO: Pass language_id, source_code, expected_output',
            'TODO: Handle API authentication and rate limiting',
            'TODO: Validate submission size limits (max 128KB)',
            'TODO: Return token for status polling',
          ],
          supportedLanguages: [
            'Python (ID: 71)',
            'JavaScript (ID: 63)',
            'Java (ID: 62)',
            'C++ (ID: 54)',
            'C (ID: 50)',
          ],
        },
        {
          id: 2,
          title: 'Runtime Analysis',
          description: 'Track execution time and performance metrics',
          method: 'analyzeRuntime(executionTime, timeLimit)',
          returns: 'RuntimeAnalysis { executionTime, timeLimit, isWithinTimeLimit, timePercentageUsed }',
          todoMarkers: [
            'TODO: Extract timing data from Judge0 response',
            'TODO: Compare against time limits (5 seconds default)',
            'TODO: Calculate percentage of time limit used',
            'TODO: Flag submissions exceeding time limits',
          ],
          thresholds: {
            optimal: '0-30% of time limit',
            acceptable: '31-70% of time limit',
            concerning: '71-99% of time limit',
            exceeded: '100%+ of time limit',
          },
        },
        {
          id: 3,
          title: 'Memory Analysis',
          description: 'Monitor memory usage during execution',
          method: 'analyzeMemory(memoryUsed, memoryLimit)',
          returns: 'MemoryAnalysis { memoryUsed, memoryLimit, isWithinMemoryLimit, memoryPercentageUsed }',
          todoMarkers: [
            'TODO: Extract memory data from Judge0 response',
            'TODO: Compare against memory limits (256MB default)',
            'TODO: Calculate percentage of memory limit used',
            'TODO: Identify memory-intensive submissions',
            'TODO: Flag potential memory leaks',
          ],
          thresholds: {
            efficient: '0-10% of memory limit',
            acceptable: '11-50% of memory limit',
            concerning: '51-90% of memory limit',
            exceeded: '90%+ of memory limit',
          },
        },
        {
          id: 4,
          title: 'Test Case Results',
          description: 'Run code against test cases and report results',
          method: 'getExecutionResults(token, testCases)',
          endpoint: 'GET /api/submissions/:id/poll',
          returns: 'ExecutionAnalysis { runtimeAnalysis, memoryAnalysis, testCaseResults[], allTestsPassed }',
          pollingStrategy: {
            initialDelay: '1 second',
            maxDelay: '5 seconds',
            multiplier: '1.5x per retry',
            maxRetries: '30 retries (~4.5 minutes)',
          },
          todoMarkers: [
            'TODO: Call Judge0 API: GET /submissions/{token}',
            'TODO: Implement polling with exponential backoff',
            'TODO: Max retries: 30, Initial delay: 1s, Max delay: 5s',
            'TODO: Check response status: 1/2 = processing, others = completed',
            'TODO: Parse result when status indicates completion',
            'TODO: Run against test cases',
            'TODO: Calculate test pass/fail rate',
            'TODO: Handle timeouts and runtime errors',
          ],
          testCaseEvaluation: [
            'Input: Test case input',
            'Expected Output: What correct solution should produce',
            'Actual Output: What submitted code produced',
            'Passed: Boolean indicating match',
            'Execution Time: Time taken for this test case',
            'Memory Used: Memory for this test case',
            'Error Message: Any error encountered',
          ],
        },
      ],
    },
  },

  dataFlowDiagrams: {
    conceptExplanationFlow: `
      Student Request
           ↓
      Frontend: Topic selected
           ↓
      Backend: GET /api/ai/concepts/{topicId}
           ↓
      SarvamService.generateConceptExplanation()
           ↓
      TODO: Call Sarvam AI API
           ↓
      Response: ConceptExplanation { explanation, keyPoints, examples, relatedConcepts }
           ↓
      Frontend: Display explanation with examples
    `,

    hintGenerationFlow: `
      Student Request
           ↓
      Frontend: Student clicks "Get Hint"
           ↓
      Backend: POST /api/ai/hints/generate
           ↓
      Check hint history (don't repeat)
           ↓
      SarvamService.generateHint()
           ↓
      TODO: Call Sarvam AI API
           ↓
      Response: HintResponse { hint, guidance, progressionLevel }
           ↓
      Frontend: Show hint with guidance
    `,

    codeSubmissionAndExecutionFlow: `
      Student Submission
           ↓
      Frontend: POST /api/submissions/submit
           ↓
      Backend: Validate code syntax
           ↓
      Judge0Service.submitExecution()
           ↓
      TODO: POST /judge0/submissions
           ↓
      Receive: Judge0 token
           ↓
      Backend: Store token in submission record
           ↓
      Frontend: Start polling
           ↓
      Backend: GET /api/submissions/{id}/poll
           ↓
      Judge0Service.pollExecutionStatus()
           ↓
      TODO: Poll /judge0/submissions/{token}
           ↓
      While (status == processing) continue polling
           ↓
      When complete: Judge0Service.getExecutionResults()
           ↓
      TODO: Analyze runtime, memory, test cases
           ↓
      Response: ExecutionAnalysis { runtime, memory, testResults, allPassed }
           ↓
      Frontend: Display results, test cases, performance metrics
    `,

    codeReviewFlow: `
      Student Submission
           ↓
      Frontend: View submission details
           ↓
      Backend: POST /api/ai/code/review
           ↓
      SarvamService.reviewCode()
           ↓
      TODO: Call Sarvam AI API
           ↓
      Response: CodeReviewResponse { issues[], overallFeedback, improvements, strengths }
           ↓
      Backend: Store review in submission history
           ↓
      Frontend: Display review with issue locations
    `,

    vivaSessionFlow: `
      Viva Start
           ↓
      Backend: POST /api/vivas/start
           ↓
      Check eligibility: submission accepted + passing score
           ↓
      Load submission and topic details
           ↓
      SarvamService.generateVivaQuestion()
           ↓
      TODO: Call Sarvam AI API
           ↓
      Response: VivaQuestionResponse { question, category, difficulty, expectedKeyPoints }
           ↓
      Frontend: Display question
           ↓
      Student types answer
           ↓
      Frontend: POST /api/vivas/{vivaId}/answer
           ↓
      Backend: Receive student answer
           ↓
      SarvamService.evaluateVivaAnswer()
           ↓
      TODO: Call Sarvam AI API for scoring
           ↓
      Response: VivaEvaluationResponse { score, feedback, keyPointsCovered, keyPointsMissed }
           ↓
      Backend: Store answer and score
           ↓
      Loop: Generate next question or end viva
    `,

    projectGenerationFlow: `
      Module Creation
           ↓
      Backend: POST /api/projects/generate
           ↓
      GeminiService.generateProject()
           ↓
      TODO: Call Gemini API with topic concept
           ↓
      Response: GeminiProjectResponse { title, description, starterCode, subtasks, testCases }
           ↓
      Backend: Store project in database
           ↓
      Backend: Generate milestones
           ↓
      GeminiService.generateMilestones()
           ↓
      TODO: Call Gemini API
           ↓
      Response: MilestoneGenerationResponse { milestones[] }
           ↓
      Backend: Store milestones
           ↓
      Frontend: Display project with milestones
    `,
  },

  integrationTodo: [
    {
      service: 'Sarvam AI',
      priority: 'HIGH',
      items: [
        'TODO: Setup Sarvam API credentials and authentication',
        'TODO: Implement request/response validation',
        'TODO: Implement caching layer for concepts and hints',
        'TODO: Build prompt engineering system for consistent outputs',
        'TODO: Implement error handling and fallback responses',
        'TODO: Add rate limiting and quota monitoring',
        'TODO: Create webhook for async processing',
        'TODO: Implement response parsing and transformation',
      ],
    },
    {
      service: 'Gemini',
      priority: 'HIGH',
      items: [
        'TODO: Setup Google Gemini API credentials',
        'TODO: Implement structured output parsing for JSON responses',
        'TODO: Build prompt templates for project and milestone generation',
        'TODO: Implement validation for generated content',
        'TODO: Add caching by topic concept',
        'TODO: Implement retry logic with exponential backoff',
        'TODO: Handle API quota and cost tracking',
        'TODO: Create tests to ensure valid project/milestone generation',
      ],
    },
    {
      service: 'Judge0',
      priority: 'CRITICAL',
      items: [
        'TODO: Setup Judge0 API credentials (RapidAPI)',
        'TODO: Implement polling logic with exponential backoff',
        'TODO: Implement timeout handling (30 second max per request)',
        'TODO: Add status code mapping (14 different status codes)',
        'TODO: Implement test case comparison logic',
        'TODO: Add memory and time metrics extraction',
        'TODO: Handle compilation errors and runtime errors',
        'TODO: Implement webhook for execution completion notifications',
        'TODO: Create database schema for storing execution results',
        'TODO: Add monitoring for Judge0 API health and quotas',
      ],
    },
  ],

  databaseSchema: {
    submissionWithExecution: `
      submissions {
        _id: ObjectId
        userId: ObjectId
        topicId: ObjectId
        code: string (max 128KB)
        language: string ('python' | 'javascript' | 'java' | 'cpp' | 'c')
        judge0Token: string | null
        status: string ('pending' | 'processing' | 'accepted' | 'wrong_answer' | ...)
        stdout: string
        stderr: string
        compileOutput: string
        executionTime: number (seconds)
        memoryUsed: number (bytes)
        testsPassed: number
        testsTotal: number
        testCaseResults: Array<{
          testNumber: number
          input: string
          expectedOutput: string
          actualOutput: string
          passed: boolean
          executionTime: number
          memoryUsed: number
          errorMessage?: string
        }>
        runtimeAnalysis: {
          executionTime: number
          timeLimit: number
          isWithinTimeLimit: boolean
          timePercentageUsed: number
        }
        memoryAnalysis: {
          memoryUsed: number
          memoryLimit: number
          isWithinMemoryLimit: boolean
          memoryPercentageUsed: number
        }
        score: number
        isAccepted: boolean
        createdAt: string (ISO 8601)
        updatedAt: string (ISO 8601)
      }
    `,

    vivaSession: `
      vivaSessions {
        _id: ObjectId
        submissionId: ObjectId
        userId: ObjectId
        topicId: ObjectId
        status: string ('started' | 'in_progress' | 'completed' | 'ended_early')
        questions: Array<{
          number: number
          question: string
          category: string ('concept' | 'implementation' | 'optimization' | 'edge_cases')
          difficulty: string ('beginner' | 'intermediate' | 'advanced')
          expectedKeyPoints: string[]
        }>
        answers: Array<{
          questionNumber: number
          answer: string
          score: number (0-10)
          feedback: string
          keyPointsCovered: string[]
          keyPointsMissed: string[]
          timestamp: string (ISO 8601)
        }>
        totalScore: number (0-100)
        averageScore: number (0-10)
        startedAt: string (ISO 8601)
        completedAt: string (ISO 8601)
      }
    `,

    codeReviews: `
      codeReviews {
        _id: ObjectId
        submissionId: ObjectId
        userId: ObjectId
        code: string
        issues: Array<{
          severity: string ('error' | 'warning' | 'info')
          line: number
          message: string
          suggestion: string
        }>
        overallFeedback: string
        improvementAreas: string[]
        strengths: string[]
        createdAt: string (ISO 8601)
      }
    `,
  },

  bestPractices: {
    apiRateLimiting: [
      'Implement per-user rate limiting (e.g., 10 requests/minute)',
      'Cache common requests (concepts, translations)',
      'Batch similar requests together',
      'Implement exponential backoff for retries',
      'Monitor API quotas and alert when approaching limits',
    ],
    errorHandling: [
      'Return meaningful error messages to frontend',
      'Log all API errors for debugging',
      'Implement fallback responses for critical failures',
      'Never expose API keys or sensitive credentials',
      'Implement timeout handling for all async calls',
    ],
    performance: [
      'Cache generated projects and milestones',
      'Cache concept explanations and translations',
      'Implement streaming for large responses',
      'Use message queues for background processing',
      'Monitor API response times and optimize',
    ],
    security: [
      'Validate all user inputs before sending to AI APIs',
      'Sanitize code submissions before analysis',
      'Store API keys in environment variables',
      'Implement HTTPS for all API calls',
      'Log and monitor suspicious patterns',
    ],
  },

  completionChecklist: {
    sarvamAI: {
      conceptExplanation: 'TODO: Implement API integration',
      hintGeneration: 'TODO: Implement API integration',
      codeReview: 'TODO: Implement API integration',
      codeAnalysis: 'TODO: Implement API integration',
      vivaQuestionGeneration: 'TODO: Implement API integration',
      vivaEvaluation: 'TODO: Implement API integration',
      translation: 'TODO: Implement API integration',
      textToSpeech: 'TODO: Implement API integration',
    },
    geminiAI: {
      projectGeneration: 'TODO: Implement API integration',
      milestoneGeneration: 'TODO: Implement API integration',
    },
    judge0: {
      codeExecution: 'TODO: Implement API integration',
      runtimeAnalysis: 'TODO: Implement metric extraction',
      memoryAnalysis: 'TODO: Implement metric extraction',
      testCaseResults: 'TODO: Implement test evaluation',
      pollingStrategy: 'TODO: Implement exponential backoff',
      errorHandling: 'TODO: Implement comprehensive error handling',
      webhookSupport: 'TODO: Implement webhook handling',
    },
    backendEndpoints: {
      conceptExplanation: 'TODO: POST /api/ai/concepts/explain',
      hintGeneration: 'TODO: POST /api/ai/hints/generate',
      codeReview: 'TODO: POST /api/ai/code/review',
      codeAnalysis: 'TODO: POST /api/ai/code/analyze',
      vivaQuestionGeneration: 'TODO: POST /api/ai/viva/questions',
      vivaEvaluation: 'TODO: POST /api/ai/viva/evaluate',
      translation: 'TODO: POST /api/ai/translate',
      textToSpeech: 'TODO: POST /api/ai/text-to-speech',
      projectGeneration: 'TODO: POST /api/projects/generate',
      milestoneGeneration: 'TODO: POST /api/milestones/generate',
      codeSubmission: 'TODO: POST /api/submissions/execute',
      submissionPolling: 'TODO: GET /api/submissions/:id/poll',
      submissionAnalysis: 'TODO: GET /api/submissions/:id/analysis',
    },
  },

  faqs: {
    'When should I use Sarvam vs Gemini?': `
      Sarvam AI: Code intelligence, analysis, hints, and viva evaluation
      Gemini: Content/project generation from concepts
      
      Use Sarvam when: Working with student-submitted code
      Use Gemini when: Generating educational content and projects
    `,

    'What is the Judge0 polling strategy?': `
      Start with 1 second delay
      Increase delay by 1.5x each retry
      Maximum delay capped at 5 seconds
      Maximum 30 retries (total ~4.5 minutes)
      This balances responsiveness with server load
    `,

    'How should I cache AI responses?': `
      Cache concepts by topic ID + concept text hash
      Cache translations by source + target language
      Cache generated projects by topic concept
      Cache milestones by project ID
      Set appropriate TTL (e.g., 7 days for concepts)
    `,

    'What happens if an AI API call fails?': `
      For non-critical features (hints, reviews):
        Return generic fallback response
      For critical features (project generation):
        Retry up to 3 times with exponential backoff
        Show user error message
        Log error for debugging
    `,
  },
};
