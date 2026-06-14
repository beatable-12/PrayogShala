import { fetchWithTimeout } from '../utils/fetchWithTimeout.js';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const SARVAM_CHAT_URL = 'https://api.sarvam.ai/v1/chat/completions';

const SARVAM_HEADERS = {
  'Content-Type': 'application/json',
  'api-subscription-key': SARVAM_API_KEY,
};

const extractJSON = (raw) => {
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // not valid JSON
    }
  }
  return null;
};

const callSarvam = async (prompt, temperature = 0.3) => {
  const response = await fetchWithTimeout(SARVAM_CHAT_URL, {
    method: 'POST',
    headers: SARVAM_HEADERS,
    body: JSON.stringify({
      model: 'sarvam-30b',
      messages: [{ role: 'user', content: prompt }],
      temperature,
    }),
  }, 20000);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sarvam API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content || data?.text || data?.result || data?.response || JSON.stringify(data);
  const parsed = extractJSON(rawContent);
  return parsed || { raw: rawContent };
};

// ──────────────────────────────────────────────
// FALLBACK TEMPLATES (MVP mode — no Sarvam API)
// ──────────────────────────────────────────────

const FALLBACK_QUESTIONS = {
  basic: (topic, project) => ({
    question: `Can you explain the core concept behind "${topic}" and how you applied it in the "${project}" project?`,
    category: 'concept',
    difficulty: 'easy',
    expectedKeyPoints: ['Understanding of the topic', 'Application to the project'],
  }),
  implementation: (topic, code) => {
    const ds = code.includes('dict') || code.includes('HashMap') || code.includes('Map(') || code.includes('{}') ? 'hash map/dictionary' : 'basic data structure';
    return {
      question: `I see you used a ${ds} in your solution. Why did you choose this over other approaches like nested loops or arrays?`,
      category: 'implementation',
      difficulty: 'medium',
      expectedKeyPoints: ['Reasoning for data structure choice', 'Trade-off awareness'],
    };
  },
  complexity: (topic) => ({
    question: `What is the time and space complexity of your solution for "${topic}"? Walk me through how you arrived at those numbers.`,
    category: 'optimization',
    difficulty: 'medium',
    expectedKeyPoints: ['Big-O analysis', 'Identifying bottlenecks'],
  }),
  optimization: (topic) => ({
    question: `If the input size grew 10x larger, how would your solution hold up? What would you optimize first?`,
    category: 'optimization',
    difficulty: 'hard',
    expectedKeyPoints: ['Scalability awareness', 'Optimization strategies'],
  }),
  edge: (topic) => ({
    question: `What edge cases did you handle in your "${topic}" solution? Are there any inputs that could break it?`,
    category: 'edge_cases',
    difficulty: 'medium',
    expectedKeyPoints: ['Edge case identification', 'Input validation'],
  }),
};

const getFallbackQuestions = (topic, project, code) => [
  { ...FALLBACK_QUESTIONS.basic(topic, project), order: 1, id: 'fb-1' },
  { ...FALLBACK_QUESTIONS.implementation(topic, code), order: 2, id: 'fb-2' },
  { ...FALLBACK_QUESTIONS.complexity(topic), order: 3, id: 'fb-3' },
  { ...FALLBACK_QUESTIONS.optimization(topic), order: 4, id: 'fb-4' },
  { ...FALLBACK_QUESTIONS.edge(topic), order: 5, id: 'fb-5' },
];

const FALLBACK_EVALUATE = (question, answer) => {
  const qLower = question.toLowerCase();
  const aLower = answer.toLowerCase();

  // Extract key terms from the question itself — relevance check
  const questionTokens = qLower
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 3 && !['what','does','your','this','that','with','have','from','they','been','will','would','could','should','about','there','their','which','when','where','how','why','tell','explain','describe','walk','think','used','using','use','like','just','also','very','much','more','some','these','those','then','than','can','did','was','were','are','the','and','for','not','you'].includes(t));

  const matchedImportant = questionTokens.filter(t => aLower.includes(t)).length;
  const totalImportant = questionTokens.length || 1;
  const relevanceRatio = matchedImportant / totalImportant;

  // Generic tech-babble penalty: if answer has common buzzwords but no question-specific terms
  const buzzwords = ['time','space','complexity','algorithm','data','structure','efficient','optimize','performance','solution','approach','method'];
  const buzzwordCount = buzzwords.filter(b => aLower.includes(b)).length;
  const hasBuzzwords = buzzwordCount >= 3;

  let score;
  if (relevanceRatio < 0.15 && !hasBuzzwords) {
    // Answer is essentially irrelevant
    score = 1 + Math.floor(Math.random() * 2); // 1-2
  } else if (relevanceRatio < 0.3) {
    // Somewhat relevant but shallow
    score = 3 + Math.floor(Math.random() * 2); // 3-4
  } else if (relevanceRatio < 0.5) {
    score = 5 + Math.floor(Math.random() * 2); // 5-6
  } else if (relevanceRatio < 0.7) {
    score = 6 + Math.floor(Math.random() * 2); // 6-7
  } else {
    score = 7 + Math.floor(Math.random() * 2); // 7-8
  }

  // Penalty for very short answers
  if (answer.split(/\s+/).length < 5) score = Math.max(1, score - 3);
  // Penalty for excessive buzzwords without substance (short + buzzwords = memorized)
  if (hasBuzzwords && relevanceRatio < 0.3) score = Math.min(score, 3);

  const finalScore = Math.max(1, Math.min(10, score));

  return {
    score: finalScore,
    conceptScore: Math.round(finalScore * 0.8),
    codeKnowledgeScore: Math.round(finalScore * 0.7),
    optimizationScore: Math.round(finalScore * 0.5),
    problemSolvingScore: Math.round(finalScore * 0.6),
    feedback: finalScore <= 3
      ? 'Your answer does not appear to address the question. Please respond directly to what was asked, referencing your code and the concepts involved.'
      : finalScore <= 5
        ? 'Your answer touches on some relevant points but lacks depth or specificity. Try connecting your response to your actual code implementation.'
        : finalScore <= 7
          ? 'Decent answer with some relevant points. To improve, provide more specific details about your implementation choices and trade-offs.'
          : 'Good answer that addresses the question. Consider diving even deeper into the technical reasoning.',
    keyPointsCovered: [],
    keyPointsMissed: [],
  };
};

const FALLBACK_ANALYSIS = (code, topic) => {
  const hasMap = /dict|HashMap|Map|{|}/.test(code);
  const hasArray = /array|list|\[\]/.test(code);
  const hasLoop = /for|while/.test(code);
  const hasRecursion = /def.*\(.*\)|function.*\(/.test(code) && code.includes('self');
  return {
    algorithmsUsed: hasRecursion ? ['Recursion'] : hasLoop ? ['Iteration'] : ['Basic algorithm'],
    dataStructuresUsed: hasMap ? ['Hash Map/Dictionary'] : hasArray ? ['Array/List'] : ['Variables'],
    optimizations: [],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    weaknesses: ['Consider edge case handling'],
    suggestions: ['Add input validation', 'Add comments for clarity'],
  };
};

const FALLBACK_FEEDBACK = (answers) => {
  const scores = answers.filter(a => a.score != null).map(a => a.score);
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;
  return {
    summary: avg >= 7 ? 'Strong performance across all areas. Good understanding of concepts and implementation.' : 'Good attempt. Focus on deepening your understanding of time complexity and edge case handling.',
    strengths: ['Attempted all questions', 'Showed willingness to learn'],
    improvements: avg >= 7 ? ['Try more advanced projects'] : ['Review complexity analysis', 'Practice edge case identification'],
  };
};

// ──────────────────────────────────────────────
// SARVAM PROMPTS
// ──────────────────────────────────────────────

const buildAnalysisPrompt = (code, topic, runtime, memory, status) => `
You are a senior code reviewer. Analyze the following code submission for a "${topic}" problem.

EXECUTION: runtime=${runtime}ms, memory=${memory}KB, status=${status}

CODE:
\`\`\`
${code}
\`\`\`

Respond ONLY with valid JSON:
{
  "algorithmsUsed": ["algorithms detected in the code"],
  "dataStructuresUsed": ["data structures used"],
  "optimizations": ["optimizations found"],
  "timeComplexity": "Big-O time complexity with reasoning",
  "spaceComplexity": "Big-O space complexity with reasoning",
  "weaknesses": ["weaknesses or unhandled cases"],
  "suggestions": ["specific improvement suggestions"]
}`;

const buildQuestionPrompt = (analysis, history, nextLevel) => {
  const levelLabels = {
    1: 'Basic Understanding — Ask a fundamental concept question about the topic.',
    2: 'Implementation Choice — Ask why they chose specific data structures or algorithms.',
    3: 'Complexity Analysis — Ask about time/space complexity trade-offs in their solution.',
    4: 'Optimization — Ask how they would improve or scale their solution.',
    5: 'Edge Cases — Ask about unhandled inputs or failure scenarios.',
  };

  const label = levelLabels[nextLevel] || 'Ask a relevant follow-up question about their code.';

  return `
You are a technical interviewer conducting a code review viva. Generate ONE personalized question based on the student's actual code.

CODE ANALYSIS: ${JSON.stringify(analysis)}

CONVERSATION HISTORY: ${history.length > 0 ? history.map(m => `[${m.role}]: ${m.content}`).join('\n') : 'No prior conversation'}

QUESTION LEVEL: ${nextLevel}/5 — ${label}

RULES:
- The question MUST reference the student's specific code, data structures, or algorithms used.
- NEVER ask generic textbook questions like "What is a HashMap?"
- NEVER repeat a question already asked.
- If they used a hash map, ask: "Why did you choose a hash map instead of nested loops?"
- If complexity can improve, ask: "Your current complexity is O(n²). How would you bring it down to O(n log n)?"
- If weaknesses exist, ask about those specific weaknesses.

Respond ONLY with valid JSON:
{
  "question": "the personalized viva question referencing their code",
  "category": "concept|implementation|optimization|edge_cases",
  "difficulty": "easy|medium|hard",
  "expectedKeyPoints": ["key point 1", "key point 2"],
  "sourceAnalysis": "what specific code element triggered this question"
}`;
};

const buildEvaluationPrompt = (question, answer, expectedKeyPoints, codeContext) => `
You are a strict technical interviewer evaluating a student's viva answer. Be critical — only give high scores for answers that are RELEVANT, SPECIFIC, and TECHNICALLY ACCURATE.

QUESTION: ${question}
STUDENT ANSWER: ${answer}
${codeContext ? `CODE ANALYSIS:\n${JSON.stringify(codeContext, null, 2)}` : ''}
${(expectedKeyPoints || []).length > 0 ? `EXPECTED KEY POINTS: ${expectedKeyPoints.join(', ')}` : ''}

SCORING RUBRIC (be strict):
- Relevance (0-10): Does the answer actually address the question? Irrelevant answers = 0-2.
- Concept Understanding (0-10): Does the student grasp the core concept? Generic buzzwords without depth = low score.
- Code Knowledge (0-10): Does the student reference their actual code, data structures, and algorithms?
- Optimization Awareness (0-10): Does the student identify trade-offs and improvement opportunities?
- Problem Solving (0-10): Does the student demonstrate analytical thinking?

RULES:
- An answer with generic tech buzzwords ("time complexity", "optimization") but no substance gets ≤ 3.
- An answer that does not reference the question topic gets ≤ 2.
- Short vague answers (under 10 words) get ≤ 3.
- Only score 8+ for answers that are specific, technically accurate, and clearly addressed to the question.

Respond ONLY with valid JSON:
{
  "score": <overall 0-10 integer>,
  "conceptScore": <0-10>,
  "codeKnowledgeScore": <0-10>,
  "optimizationScore": <0-10>,
  "problemSolvingScore": <0-10>,
  "feedback": "critical 1-2 sentence feedback — explain WHY the score is what it is",
  "keyPointsCovered": ["specific covered points"],
  "keyPointsMissed": ["specific missed points"]
}`;

// ──────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ──────────────────────────────────────────────

export const analyzeCode = async (sourceCode, topicTitle, runtime, memory, executionStatus) => {
  try {
    const prompt = buildAnalysisPrompt(sourceCode, topicTitle, runtime, memory, executionStatus);
    const result = await callSarvam(prompt, 0.2);
    return {
      algorithmsUsed: Array.isArray(result.algorithmsUsed) ? result.algorithmsUsed : [],
      dataStructuresUsed: Array.isArray(result.dataStructuresUsed) ? result.dataStructuresUsed : [],
      optimizations: Array.isArray(result.optimizations) ? result.optimizations : [],
      timeComplexity: result.timeComplexity || '',
      spaceComplexity: result.spaceComplexity || '',
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    };
  } catch {
    return FALLBACK_ANALYSIS(sourceCode, topicTitle);
  }
};

export const generateQuestion = async (codeAnalysis, conversationHistory = [], level = 1) => {
  try {
    const prompt = buildQuestionPrompt(codeAnalysis, conversationHistory, level);
    const result = await callSarvam(prompt, 0.5);
    return {
      id: `q-${level}-${Date.now()}`,
      order: level,
      question: result.question || 'Can you explain your approach to this problem?',
      category: ['concept', 'implementation', 'optimization', 'edge_cases'].includes(result.category) ? result.category : 'concept',
      difficulty: ['easy', 'medium', 'hard'].includes(result.difficulty) ? result.difficulty : 'medium',
      expectedKeyPoints: Array.isArray(result.expectedKeyPoints) ? result.expectedKeyPoints : [],
      sourceAnalysis: result.sourceAnalysis || 'general concept understanding',
    };
  } catch {
    const fb = getFallbackQuestions('the topic', 'the project', '')[
      Math.min(level - 1, 4)
    ];
    return {
      id: `q-${level}-fb`,
      order: level,
      question: fb.question,
      category: fb.category,
      difficulty: fb.difficulty,
      expectedKeyPoints: fb.expectedKeyPoints,
      sourceAnalysis: 'fallback template',
    };
  }
};

export const evaluateAnswer = async (question, studentAnswer, expectedKeyPoints, codeContext) => {
  try {
    const prompt = buildEvaluationPrompt(question, studentAnswer, expectedKeyPoints, codeContext);
    const result = await callSarvam(prompt, 0.3);
    const score = Math.max(0, Math.min(10, Math.round(result.score ?? 1)));
    return {
      score,
      conceptScore: Math.max(0, Math.min(10, Math.round(result.conceptScore ?? score))),
      codeKnowledgeScore: Math.max(0, Math.min(10, Math.round(result.codeKnowledgeScore ?? score))),
      optimizationScore: Math.max(0, Math.min(10, Math.round(result.optimizationScore ?? score))),
      problemSolvingScore: Math.max(0, Math.min(10, Math.round(result.problemSolvingScore ?? score))),
      feedback: result.feedback || 'Your answer has been evaluated.',
      keyPointsCovered: Array.isArray(result.keyPointsCovered) ? result.keyPointsCovered : [],
      keyPointsMissed: Array.isArray(result.keyPointsMissed) ? result.keyPointsMissed : [],
    };
  } catch {
    return FALLBACK_EVALUATE(question, studentAnswer);
  }
};

export const generateFeedback = async (conversationHistory, codeAnalysis) => {
  try {
    const historyStr = conversationHistory
      .map(m => `[${m.role}]: ${m.content}${m.score != null ? ` (score: ${m.score}/10)` : ''}`)
      .join('\n');
    const analysisStr = JSON.stringify(codeAnalysis, null, 2);

    const prompt = `You are a senior mentor. Generate final viva feedback.

HISTORY:
${historyStr}

ANALYSIS:
${analysisStr}

Respond ONLY with valid JSON:
{
  "summary": "overall performance in 2-3 sentences",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`;

    const result = await callSarvam(prompt, 0.3);
    return {
      summary: result.summary || 'Viva session completed.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      improvements: Array.isArray(result.improvements) ? result.improvements : [],
    };
  } catch {
    const answers = conversationHistory.filter(m => m.role === 'student');
    return FALLBACK_FEEDBACK(answers);
  }
};