/**
 * src/utils/aiServiceIntegration.ts
 * 
 * Step-by-step integration guide for PrayogShala AI services
 * 
 * This file provides practical integration examples and implementation checklist
 * for connecting Sarvam AI, Gemini, and Judge0 services to the PrayogShala backend.
 */

export const AI_SERVICE_INTEGRATION_GUIDE = {
  introduction: `
    This guide provides step-by-step instructions for integrating AI services with PrayogShala.
    
    Overview:
    1. Sarvam AI - Code intelligence and viva
    2. Gemini - Project and milestone generation
    3. Judge0 - Code execution and testing
    
    Each service requires API credentials, endpoint configuration, and error handling.
  `,

  // ============= SARVAM AI INTEGRATION =============

  sarvamIntegration: {
    stepByStep: `
      STEP 1: Setup API Credentials
      =============================
      1. Go to https://console.sarvam.ai
      2. Create API key for your application
      3. Add to environment variables: SARVAM_API_KEY=<your-key>
      4. Add endpoint to config: SARVAM_BASE_URL=https://api.sarvam.ai/v1
      
      STEP 2: Implement Concept Explanation
      ======================================
      const response = await sarvamService.generateConceptExplanation(
        'Recursion',
        'A function that calls itself',
        'beginner'
      );
      
      TODO: Backend endpoint implementation
      @POST /api/ai/concepts/explain
      Body: { topicTitle, conceptText, difficulty }
      Response: ConceptExplanation { explanation, keyPoints, examples }
      
      STEP 3: Implement Hint Generation
      =================================
      const hint = await sarvamService.generateHint(
        'Binary Search',
        'Find element in sorted array',
        2, // hint number
        submittedCode,
        'python'
      );
      
      TODO: Backend endpoint implementation
      @POST /api/ai/hints/generate
      Body: { topicTitle, problemDescription, hintNumber, submittedCode, language }
      Response: HintResponse { hint, guidance, progressionLevel }
      
      STEP 4: Implement Code Review
      =============================
      const review = await sarvamService.reviewCode(
        studentCode,
        'python',
        'Sorting Algorithm'
      );
      
      TODO: Backend endpoint implementation
      @POST /api/ai/code/review
      Body: { code, language, topicTitle }
      Response: CodeReviewResponse { issues[], overallFeedback }
      
      STEP 5: Implement Code Analysis
      ===============================
      const analysis = await sarvamService.analyzeCode(
        studentCode,
        'python'
      );
      
      TODO: Backend endpoint implementation
      @POST /api/ai/code/analyze
      Body: { code, language }
      Response: SarvamCodeAnalysis { algorithmsUsed, timeComplexity, suggestions }
      
      STEP 6: Implement Viva Question Generation
      ==========================================
      const question = await sarvamService.generateVivaQuestion(
        topicTitle,
        submittedCode,
        'python',
        previousQuestions
      );
      
      TODO: Backend endpoint implementation
      @POST /api/ai/viva/questions
      Body: { topicTitle, submittedCode, language, previousQuestions }
      Response: VivaQuestionResponse { question, category, difficulty }
      
      STEP 7: Implement Viva Answer Evaluation
      ========================================
      const evaluation = await sarvamService.evaluateVivaAnswer(
        question,
        studentAnswer,
        submittedCode,
        topicTitle,
        'python'
      );
      
      TODO: Backend endpoint implementation
      @POST /api/ai/viva/evaluate
      Body: { question, studentAnswer, submittedCode, topicTitle }
      Response: VivaEvaluationResponse { score, feedback, keyPointsCovered }
    `,

    apiImplementationTemplate: `
      // Backend: POST /api/ai/concepts/explain
      router.post('/concepts/explain', async (req, res) => {
        try {
          const { topicTitle, conceptText, difficulty, language } = req.body;
          
          // TODO: Validate inputs
          // TODO: Check cache for existing explanation
          
          const explanation = await sarvamService.generateConceptExplanation(
            topicTitle,
            conceptText,
            difficulty,
            language
          );
          
          // TODO: Store in cache
          // TODO: Log request for analytics
          
          res.json({ success: true, data: explanation });
        } catch (error) {
          // TODO: Handle errors gracefully
          res.status(500).json({ error: error.message });
        }
      });
    `,

    promptEngineering: {
      conceptExplanation: `
        System Prompt:
        "You are an expert programming teacher explaining concepts clearly.
         Provide:
         1. Clear explanation (2-3 sentences)
         2. 3-5 key points
         3. 2-3 practical examples
         4. 2-3 related concepts"
        
        User Prompt:
        "Explain ${conceptText} at ${difficulty} level for a student learning ${topicTitle}"
      `,

      hintGeneration: `
        System Prompt:
        "You are a helpful tutor guiding students to solutions without giving answers.
         Hint ${hintNumber} should be progressively less vague than previous hints.
         Avoid revealing the solution directly."
        
        User Prompt:
        "Hint ${hintNumber} for solving: ${problemDescription}
         Current code approach: ${submittedCode}
         Guide the student without revealing the solution."
      `,

      vivaQuestion: `
        System Prompt:
        "You are an expert viva interviewer testing understanding.
         Generate a question that:
         1. Tests understanding of the submitted code
         2. Is not one of: ${previousQuestions.join(', ')}
         3. Has difficulty level: ${difficulty}
         4. Is in category: concept, implementation, optimization, or edge_cases"
        
        User Prompt:
        "Generate a viva question about this code:
         Topic: ${topicTitle}
         Code: ${submittedCode}
         Language: ${language}"
      `,
    },

    cachingStrategy: `
      Cache Key Structure:
      - Concept: "concept:${topicId}:${conceptHash}"
      - Hint: "hint:${topicId}:${hintNumber}"
      - Translation: "trans:${textHash}:${targetLang}"
      
      TTL (Time-to-Live):
      - Concepts: 7 days
      - Hints: 30 days
      - Translations: 7 days
      
      Implementation:
      // Check cache before API call
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
      
      // Call API
      const result = await sarvamService.generateConceptExplanation(...);
      
      // Store in cache
      await redis.setex(cacheKey, 604800, JSON.stringify(result)); // 7 days
    `,

    errorHandling: `
      Error Scenarios:
      
      1. API Timeout (>30s):
         - Retry up to 2 times
         - Return generic fallback message
         - Log error for monitoring
      
      2. Rate Limit (429):
         - Retry after 60 seconds
         - Queue request for later processing
         - Inform user: "Please try again in a moment"
      
      3. Invalid API Key:
         - Log critical error
         - Alert ops team
         - Return 500 error
      
      4. Service Down (5xx):
         - Retry 3 times with exponential backoff
         - Show user: "Service temporarily unavailable"
         - Use cached response if available
      
      Implementation:
      try {
        return await sarvamService.generateConceptExplanation(...);
      } catch (error) {
        if (error.code === 429) {
          // Rate limited - queue and retry
          await queue.add('concept_explanation', { ...params });
          return getCachedOrDefault(...);
        } else if (error.code === 500) {
          // Service down - use cache
          const cached = await redis.get(cacheKey);
          return cached ? JSON.parse(cached) : getDefaultExplanation();
        } else {
          throw error;
        }
      }
    `,
  },

  // ============= GEMINI INTEGRATION =============

  geminiIntegration: {
    stepByStep: `
      STEP 1: Setup API Credentials
      =============================
      1. Go to https://aistudio.google.com
      2. Create API key for your application
      3. Add to environment variables: GEMINI_API_KEY=<your-key>
      4. Add endpoint: GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1
      
      STEP 2: Implement Project Generation
      ====================================
      const project = await geminiService.generateProject(
        'Dynamic Programming',
        'Learn to solve problems by breaking into subproblems',
        'intermediate',
        90 // minutes
      );
      
      TODO: Backend endpoint implementation
      @POST /api/projects/generate
      Body: { topicTitle, conceptText, difficulty, estimatedMinutes }
      Response: GeminiProjectResponse { title, description, starterCode, subtasks, testCases }
      
      STEP 3: Implement Milestone Generation
      ======================================
      const milestones = await geminiService.generateMilestones(
        projectTitle,
        projectDescription,
        5 // number of milestones
      );
      
      TODO: Backend endpoint implementation
      @POST /api/milestones/generate
      Body: { projectTitle, projectDescription, numberOfMilestones }
      Response: MilestoneGenerationResponse { milestones[] }
    `,

    jsonSchemaValidation: `
      Expected Project Response Schema:
      {
        title: string,
        description: string,
        starterCode: string,
        subtasks: [
          {
            order: number,
            title: string,
            description: string,
            isRequired: boolean
          }
        ],
        testCases: [
          {
            input: string,
            expectedOutput: string,
            isHidden: boolean
          }
        ]
      }
      
      Validation Checks:
      TODO: Verify response is valid JSON
      TODO: Verify all required fields present
      TODO: Verify no empty arrays
      TODO: Verify starterCode is syntactically valid
      TODO: Verify test cases have matching pairs
      TODO: Verify subtasks are ordered 1-N
      
      Implementation:
      try {
        const project = await geminiService.generateProject(...);
        validateProjectSchema(project);
        validateStarterCodeSyntax(project.starterCode);
        validateTestCases(project.testCases);
        return project;
      } catch (error) {
        // Retry project generation
        console.error('Invalid project schema:', error);
        throw new Error('Failed to generate valid project');
      }
    `,

    promptOptimization: `
      Project Generation Prompt:
      
      System:
      "You are an expert curriculum designer creating programming projects.
       Generate a comprehensive project with:
       - Clear problem statement
       - Achievable subtasks (3-6)
       - Working starter code
       - Test cases that validate the solution
       
       JSON Response Format:
       {
         title: string,
         description: string,
         starterCode: string,
         subtasks: [{order, title, description, isRequired}],
         testCases: [{input, expectedOutput, isHidden}]
       }"
      
      User:
      "Create a ${difficulty} project for ${topicTitle}.
       Concept: ${conceptText}
       Estimated time: ${estimatedMinutes} minutes
       
       Return ONLY valid JSON, no explanations."
      
      Tips:
      - Always request JSON format explicitly
      - Include language hints in starter code
      - Ensure test cases are achievable
      - Mix required (60%) and optional (40%) subtasks
    `,

    cachingAndRetry: `
      Caching Strategy:
      - Cache generated projects by topic concept hash
      - TTL: 30 days (concepts rarely change)
      - Key: "project:${topicHash}"
      
      Retry Strategy:
      - Max retries: 3
      - Initial delay: 1 second
      - Backoff multiplier: 2x
      - Max delay: 10 seconds
      
      Total timeout: ~13 seconds
      
      Implementation:
      async function generateProjectWithRetry(topicTitle, concept, difficulty, time) {
        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const project = await geminiService.generateProject(
              topicTitle, concept, difficulty, time
            );
            validateProjectSchema(project);
            return project;
          } catch (error) {
            lastError = error;
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(r => setTimeout(r, delay));
          }
        }
        throw lastError;
      }
    `,
  },

  // ============= JUDGE0 INTEGRATION =============

  judge0Integration: {
    stepByStep: `
      STEP 1: Setup API Credentials
      =============================
      1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
      2. Subscribe to Judge0 API
      3. Get API key from dashboard
      4. Add to environment: JUDGE0_API_KEY=<your-key>
      5. API endpoint: https://judge0-ce.p.rapidapi.com
      
      STEP 2: Submit Code for Execution
      =================================
      const token = await judge0Service.submitExecution(
        studentCode,
        'python',
        inputData // stdin
      );
      
      TODO: Backend endpoint implementation
      @POST /api/submissions/execute
      Body: { code, language, stdin? }
      Response: { token: string }
      
      Store token in submission document for polling.
      
      STEP 3: Poll Execution Status
      =============================
      // Frontend or backend polling
      while (true) {
        const result = await judge0Service.pollExecutionStatus(token);
        
        if (result.status === 'accepted' || 
            result.status === 'wrong_answer' ||
            result.status === 'compilation_error') {
          break; // Execution complete
        }
        
        // Wait before next poll (exponential backoff)
        await delay(pollingDelay);
      }
      
      TODO: Backend endpoint implementation
      @GET /api/submissions/:id/poll
      Response: ExecutionResult { status, stdout, stderr, executionTime, memory }
      
      STEP 4: Analyze Execution Results
      =================================
      const analysis = await judge0Service.getExecutionResults(
        token,
        testCases
      );
      
      TODO: Backend endpoint implementation
      @GET /api/submissions/:id/analysis
      Response: ExecutionAnalysis {
        runtimeAnalysis: { executionTime, timeLimit, isWithinTimeLimit },
        memoryAnalysis: { memoryUsed, memoryLimit, isWithinMemoryLimit },
        testCaseResults: [{ input, expectedOutput, actualOutput, passed }],
        allTestsPassed: boolean
      }
    `,

    pollingImplementation: `
      Exponential Backoff Polling Strategy:
      
      const MAX_RETRIES = 30;
      const INITIAL_DELAY = 1000; // 1 second
      const MAX_DELAY = 5000; // 5 seconds
      const BACKOFF_MULTIPLIER = 1.5;
      
      async function pollWithExponentialBackoff(token) {
        let delay = INITIAL_DELAY;
        
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          const result = await judge0Service.pollExecutionStatus(token);
          
          // Status 1 or 2 means still processing
          if (result.statusId === 1 || result.statusId === 2) {
            console.log(\`Attempt \${attempt + 1}: Still processing, waiting \${delay}ms\`);
            await new Promise(r => setTimeout(r, delay));
            
            delay = Math.min(delay * BACKOFF_MULTIPLIER, MAX_DELAY);
            continue;
          }
          
          // Execution complete
          return result;
        }
        
        throw new Error('Execution timeout after 4.5 minutes');
      }
      
      Polling Times:
      Attempt 1: wait 1.0s
      Attempt 2: wait 1.5s
      Attempt 3: wait 2.25s
      ...
      Attempt 10: wait 5.0s (capped)
      ...
      Total: ~4.5 minutes maximum
    `,

    statusCodeMapping: `
      Judge0 Status Codes:
      
      1 = In Queue (processing)
      2 = Processing (processing)
      3 = Accepted (accepted) ✓
      4 = Wrong Answer (wrong_answer) ✗
      5 = Time Limit Exceeded (time_limit_exceeded) ✗
      6 = Compilation Error (compilation_error) ✗
      7 = Runtime Error - SIGSEGV (runtime_error) ✗
      8 = Runtime Error - SIGXFSZ (runtime_error) ✗
      9 = Runtime Error - SIGFPE (runtime_error) ✗
      10 = Runtime Error - SIGABRT (runtime_error) ✗
      11 = Runtime Error - NZEC (runtime_error) ✗
      12 = Runtime Error - Other (runtime_error) ✗
      13 = Submission Error (failed) ✗
      14 = Can be judged (processing)
      
      Mapping Implementation:
      const statusMap = {
        1: 'processing',
        2: 'processing',
        3: 'accepted',
        4: 'wrong_answer',
        5: 'time_limit_exceeded',
        6: 'compilation_error',
        7: 'runtime_error',
        // ... etc
      };
      
      const submissionStatus = statusMap[judge0StatusId] || 'failed';
    `,

    testCaseEvaluation: `
      Running Against Test Cases:
      
      For each test case:
      1. Submit code with stdin = test input
      2. Wait for execution
      3. Compare actual output with expected output
      4. Record pass/fail
      5. Collect execution time and memory
      
      TODO: Implement test case runner
      async function runTestCases(code, language, testCases) {
        const results = [];
        
        for (const [index, testCase] of testCases.entries()) {
          const token = await judge0Service.submitExecution(
            code,
            language,
            testCase.input
          );
          
          const result = await pollWithExponentialBackoff(token);
          
          const passed = result.stdout.trim() === 
                        testCase.expectedOutput.trim();
          
          results.push({
            testNumber: index + 1,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: result.stdout,
            passed,
            executionTime: result.time,
            memoryUsed: result.memory,
            errorMessage: result.stderr
          });
        }
        
        return {
          testCaseResults: results,
          totalPassed: results.filter(r => r.passed).length,
          allPassed: results.every(r => r.passed)
        };
      }
      
      Performance Metrics:
      - For 10 test cases: ~10-50 seconds total
      - Can optimize by running tests in parallel
      - But Judge0 API may rate limit
    `,

    languageIds: `
      Supported Languages and Judge0 IDs:
      
      50 = C
      54 = C++
      62 = Java
      63 = JavaScript
      71 = Python
      
      Additional languages available:
      45 = Assembly (x86)
      46 = Bash
      47 = BASIC
      48 = C#
      49 = Clojure
      51 = COBOL
      52 = Common Lisp
      53 = D
      55 = Objective-C
      56 = OCaml
      57 = Pascal
      58 = Perl
      59 = PHP
      60 = Prolog
      61 = Ruby
      64 = Go
      65 = Scala
      66 = SQL
      67 = Swift
      68 = TypeScript
      ... and more
      
      Implementation:
      const languageMap = {
        'c': 50,
        'cpp': 54,
        'java': 62,
        'javascript': 63,
        'python': 71,
      };
    `,

    errorHandling: `
      Error Scenarios:
      
      1. Compilation Error (Status 6)
         - Extract stderr (compile_output)
         - Show to user: "Your code has syntax errors"
         - Provide snippet of error message
         - Allow resubmission
      
      2. Runtime Error (Status 7-12)
         - Extract stderr (output)
         - Show to user: "Runtime error occurred"
         - Provide error message
         - Suggest debugging approaches
      
      3. Time Limit Exceeded (Status 5)
         - Show to user: "Code took too long to execute"
         - Suggest optimization approaches
         - Show partial results if available
      
      4. Wrong Answer (Status 4)
         - Show test case results
         - Highlight which tests failed
         - Show expected vs actual output
         - Allow debugging with print statements
      
      5. Accepted (Status 3)
         - Show congratulations message
         - Show all test cases passed
         - Calculate skill points
         - Offer viva opportunity
      
      6. API Rate Limit
         - Queue submission for later
         - Tell user: "Queue position: X"
         - Retry after delay
      
      Implementation:
      function handleExecutionResult(result) {
        switch (result.statusId) {
          case 3: // Accepted
            return { message: 'All tests passed!', canStartViva: true };
          case 4: // Wrong Answer
            return { 
              message: 'Some tests failed',
              failedTests: getFailedTests(result)
            };
          case 5: // TLE
            return { message: 'Code exceeded time limit (5s)' };
          case 6: // Compilation Error
            return { 
              message: 'Compilation error',
              details: result.compileOutput
            };
          default:
            return { message: 'Execution failed', details: result.stderr };
        }
      }
    `,

    databaseStorageSchema: `
      Store submission execution data:
      
      submissions.findByIdAndUpdate(submissionId, {
        judge0Token: token,
        status: 'processing',
        executionStartedAt: new Date()
      });
      
      // After execution completes:
      submissions.findByIdAndUpdate(submissionId, {
        status: result.status,
        judge0Token: token,
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        executionTime: result.time,
        memoryUsed: result.memory,
        testCaseResults: [{
          testNumber: 1,
          input: ...,
          expectedOutput: ...,
          actualOutput: ...,
          passed: true/false,
          executionTime: 0.15,
          memoryUsed: 2048
        }],
        runtimeAnalysis: {
          executionTime: 0.5,
          timeLimit: 5,
          isWithinTimeLimit: true,
          timePercentageUsed: 10
        },
        memoryAnalysis: {
          memoryUsed: 2048,
          memoryLimit: 256000,
          isWithinMemoryLimit: true,
          memoryPercentageUsed: 0.8
        },
        testsPassed: 10,
        testsTotal: 10,
        score: 100,
        isAccepted: true,
        completedAt: new Date()
      });
    `,
  },

  // ============= COMPLETE INTEGRATION CHECKLIST =============

  completionChecklist: {
    phase1_Setup: [
      '[ ] Setup Sarvam AI API credentials and config',
      '[ ] Setup Gemini API credentials and config',
      '[ ] Setup Judge0 API credentials and config',
      '[ ] Create environment variable file (.env)',
      '[ ] Update config.ts with all API endpoints',
    ],

    phase2_SarvamAI: [
      '[ ] Implement POST /api/ai/concepts/explain endpoint',
      '[ ] Implement POST /api/ai/hints/generate endpoint',
      '[ ] Implement POST /api/ai/code/review endpoint',
      '[ ] Implement POST /api/ai/code/analyze endpoint',
      '[ ] Implement POST /api/ai/viva/questions endpoint',
      '[ ] Implement POST /api/ai/viva/evaluate endpoint',
      '[ ] Implement POST /api/ai/translate endpoint',
      '[ ] Implement POST /api/ai/text-to-speech endpoint',
      '[ ] Add Sarvam error handling and fallbacks',
      '[ ] Add Sarvam response caching',
      '[ ] Write unit tests for Sarvam service',
    ],

    phase2_Gemini: [
      '[ ] Implement POST /api/projects/generate endpoint',
      '[ ] Implement POST /api/milestones/generate endpoint',
      '[ ] Add JSON schema validation for generated content',
      '[ ] Add Gemini error handling and retry logic',
      '[ ] Add project/milestone caching',
      '[ ] Write unit tests for Gemini service',
    ],

    phase2_Judge0: [
      '[ ] Implement POST /api/submissions/execute endpoint',
      '[ ] Implement GET /api/submissions/:id/poll endpoint',
      '[ ] Implement GET /api/submissions/:id/analysis endpoint',
      '[ ] Implement exponential backoff polling logic',
      '[ ] Map all 14 Judge0 status codes',
      '[ ] Implement test case running and comparison',
      '[ ] Implement runtime and memory analysis',
      '[ ] Add Judge0 error handling',
      '[ ] Add submission storage in MongoDB',
      '[ ] Write unit tests for Judge0 service',
    ],

    phase3_Integration: [
      '[ ] Connect frontend submission flow to backend',
      '[ ] Connect viva flow to backend',
      '[ ] Connect project generation to module creation',
      '[ ] Test end-to-end submission workflow',
      '[ ] Test end-to-end viva workflow',
      '[ ] Test end-to-end project generation',
      '[ ] Load test with multiple submissions',
      '[ ] Test error handling and fallbacks',
    ],

    phase4_Production: [
      '[ ] Setup monitoring and alerts for AI APIs',
      '[ ] Setup error logging and analytics',
      '[ ] Setup rate limiting and quota management',
      '[ ] Setup backup services for API failures',
      '[ ] Document API integration for team',
      '[ ] Create runbooks for common issues',
      '[ ] Setup automated health checks',
      '[ ] Perform security audit of API keys',
      '[ ] Setup database backups',
      '[ ] Deploy to production',
    ],
  },
};
