import { fetchWithTimeout, memoize } from '../utils/fetchWithTimeout.js';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const SARVAM_API_BASE = 'https://api.sarvam.ai';
const SARVAM_CHAT_URL = `${SARVAM_API_BASE}/v1/chat/completions`;

const SARVAM_HEADERS = {
  'Content-Type': 'application/json',
  'api-subscription-key': SARVAM_API_KEY,
};

const LANG_CODE_MAP = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Kannada: 'kn-IN',
  Bengali: 'bn-IN',
  Marathi: 'mr-IN',
};

const buildLangInstruction = (language) =>
  language && language !== 'English'
    ? `IMPORTANT: Respond entirely in ${language}. Use ${language} for explanations, examples, and all text. Do NOT use English.`
    : 'Respond in English unless the user asks in another language.';

const buildExplainPrompt = (topic, language) => {
  return `${buildLangInstruction(language)}

You are Prayog Mentor, a multilingual coding mentor. Explain the problem "${topic}" in a clear, structured way.

Include:
1. Problem explanation — what the problem is asking
2. Example walkthrough — step through a sample input
3. Visual intuition — how to think about it visually

Respond ONLY with valid JSON:
{
  "explanation": "clear problem explanation in the specified language",
  "exampleWalkthrough": "step-by-step walkthrough of an example",
  "visualIntuition": "visual/mental model to understand the problem"
}`;
};

const buildApproachPrompt = (topic, language) => {
  return `${buildLangInstruction(language)}

You are Prayog Mentor. Suggest approaches for the problem "${topic}".

Provide THREE levels of approach (do NOT give full code):
1. Brute Force Idea — simplest working solution
2. Better Approach — optimized with better data structures
3. Optimal Approach — best time/space complexity

Respond ONLY with valid JSON:
{
  "bruteForce": "brute force approach explanation",
  "better": "improved approach with reasoning",
  "optimal": "optimal approach with complexity"
}`;
};

const buildComplexityPrompt = (topic, solutionHint, language) => {
  return `${buildLangInstruction(language)}

You are Prayog Mentor. Analyze time and space complexity for the problem "${topic}".

Provide:
1. Expected time complexity with reasoning
2. Expected space complexity with reasoning
3. Optimization suggestions

Respond ONLY with valid JSON:
{
  "timeComplexity": "Big-O time complexity with explanation",
  "spaceComplexity": "Big-O space complexity with explanation",
  "optimizations": ["optimization 1", "optimization 2"]
}`;
};

const buildHintPrompt = (topic, hintLevel, language) => {
  return `${buildLangInstruction(language)}

You are Prayog Mentor. Give hint level ${hintLevel} for the problem "${topic}".

Provide ONE progressive hint. Hint ${hintLevel} should be:
- Level 1: Directional hint (what to think about)
- Level 2: Data structure hint (which data structure helps)
- Level 3: Algorithm hint (which algorithm pattern)
- Level 4: Almost revealing (specific approach details)

Do NOT give the full solution.

Respond ONLY with valid JSON:
{
  "hint": "single progressive hint at level ${hintLevel}",
  "nextLevelAvailable": true
}`;
};

const buildDebugPrompt = (code, problem, language) => {
  return `${buildLangInstruction(language)}

You are Prayog Mentor. Debug the following code for the problem "${problem}".

Code:
\`\`\`
${code}
\`\`\`

Identify:
1. Potential bugs
2. Missing edge cases
3. Logic issues
4. Fix suggestions

Respond ONLY with valid JSON:
{
  "bugs": ["bug 1 with line/context", "bug 2 with line/context"],
  "edgeCases": ["edge case 1 missed", "edge case 2 missed"],
  "logicIssues": ["logic issue 1", "logic issue 2"],
  "suggestions": ["fix suggestion 1", "fix suggestion 2"]
}`;
};

const buildReviewPrompt = (code, problem, language) => {
  return `${buildLangInstruction(language)}

You are Prayog Mentor. Review the following solution for "${problem}".

Code:
\`\`\`
${code}
\`\`\`

Provide:
1. Strengths — what the solution does well
2. Weaknesses — areas that need improvement
3. Optimization opportunities — how to make it faster/better

Respond ONLY with valid JSON:
{
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "optimizations": ["optimization 1 with reasoning", "optimization 2 with reasoning"]
}`;
};

const buildVivaPrompt = (topic, language) => {
  return `${buildLangInstruction(language)}

You are Prayog Mentor. Generate 3 mock viva questions for the topic "${topic}".

Questions should test:
1. Conceptual understanding
2. Implementation details
3. Trade-offs and alternatives

Respond ONLY with valid JSON:
{
  "questions": [
    {
      "question": "viva question 1 testing concept understanding",
      "category": "concept",
      "difficulty": "medium"
    },
    {
      "question": "viva question 2 testing implementation",
      "category": "implementation",
      "difficulty": "hard"
    },
    {
      "question": "viva question 3 testing trade-offs",
      "category": "trade-offs",
      "difficulty": "medium"
    }
  ]
}`;
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

const _callSarvamLLM = async (prompt, language) => {
  const response = await fetchWithTimeout(SARVAM_CHAT_URL, {
    method: 'POST',
    headers: SARVAM_HEADERS,
    body: JSON.stringify({
      model: 'sarvam-30b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  }, 20000);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sarvam API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data;
};

const callSarvamLLM = memoize(_callSarvamLLM);

const rawResponse = async (prompt, language) => {
  const data = await callSarvamLLM(prompt, language);
  const rawText = data?.choices?.[0]?.message?.content || data?.text || data?.result || data?.response || JSON.stringify(data);
  const parsed = extractJSON(rawText);
  return parsed || { raw: rawText };
};

export const explainConcept = async (topic, language = 'English') => {
  const prompt = buildExplainPrompt(topic, language);
  const result = await rawResponse(prompt, language);
  return {
    explanation: result.explanation || '',
    exampleWalkthrough: result.exampleWalkthrough || '',
    visualIntuition: result.visualIntuition || '',
  };
};

export const suggestApproach = async (topic, language = 'English') => {
  const prompt = buildApproachPrompt(topic, language);
  const result = await rawResponse(prompt, language);
  return {
    bruteForce: result.bruteForce || '',
    better: result.better || '',
    optimal: result.optimal || '',
  };
};

export const analyzeComplexity = async (topic, language = 'English') => {
  const prompt = buildComplexityPrompt(topic, language);
  const result = await rawResponse(prompt, language);
  return {
    timeComplexity: result.timeComplexity || '',
    spaceComplexity: result.spaceComplexity || '',
    optimizations: result.optimizations || [],
  };
};

export const generateHint = async (topic, hintLevel = 1, language = 'English') => {
  const prompt = buildHintPrompt(topic, hintLevel, language);
  const result = await rawResponse(prompt, language);
  return {
    hint: result.hint || 'Think about the problem constraints and what data structure fits best.',
    nextLevelAvailable: result.nextLevelAvailable !== false,
    allHints: [],
  };
};

export const debugCode = async (code, problem, language = 'English') => {
  const prompt = buildDebugPrompt(code, problem, language);
  const result = await rawResponse(prompt, language);
  return {
    bugs: result.bugs || [],
    edgeCases: result.edgeCases || [],
    logicIssues: result.logicIssues || [],
    suggestions: result.suggestions || [],
  };
};

export const reviewSolution = async (code, problem, language = 'English') => {
  const prompt = buildReviewPrompt(code, problem, language);
  const result = await rawResponse(prompt, language);
  return {
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    optimizations: result.optimizations || [],
  };
};

export const generateVivaQuestions = async (topic, language = 'English') => {
  const prompt = buildVivaPrompt(topic, language);
  const result = await rawResponse(prompt, language);
  return {
    questions: result.questions || [],
  };
};

export const translateText = async (text, targetLang) => {
  const langCode = LANG_CODE_MAP[targetLang];

  if (!langCode || langCode === 'en-IN') {
    return { translatedText: text, detectedLanguage: 'English' };
  }

  const response = await fetchWithTimeout(`${SARVAM_API_BASE}/translate`, {
    method: 'POST',
    headers: SARVAM_HEADERS,
    body: JSON.stringify({
      input: text,
      source_language_code: 'en-IN',
      target_language_code: langCode,
      speaker_gender: 'Female',
      mode: 'formal',
      model: 'mayura:v1',
      enable_preprocessing: true,
    }),
  }, 15000);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sarvam Translate error ${response.status}: ${body}`);
  }

  const data = await response.json();
  return {
    translatedText: data.translated_text || data.translatedText || text,
    detectedLanguage: targetLang,
  };
};

export const textToSpeech = async (text, language = 'English') => {
  const langCode = LANG_CODE_MAP[language] || 'en-IN';

  const response = await fetchWithTimeout(`${SARVAM_API_BASE}/text-to-speech`, {
    method: 'POST',
    headers: SARVAM_HEADERS,
    body: JSON.stringify({
      input: text,
      target_language_code: langCode,
      speaker_gender: 'Female',
      pace: 1.0,
      pitch: 0.0,
      loudness: 1.0,
      model: 'mayura:v1',
      enable_preprocessing: true,
    }),
  }, 15000);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sarvam TTS error ${response.status}: ${body}`);
  }

  const data = await response.json();
  return {
    audioBase64: data.audio_content || data.audio || null,
    audioMimeType: 'audio/wav',
    language,
  };
};
