/**
 * services/geminiService.js
 *
 * Proxy wrapper for Google Gemini API calls.
 *
 * Methods:
 *  - generateProjectIdea(topicTitle, difficulty)
 *      → Returns a structured JSON project spec for Project Forge
 *
 *  - startViva(code, topicTitle, language)
 *      → Generates the first viva question based on submitted code
 *
 *  - evaluateAnswer(code, question, studentAnswer, topicTitle)
 *      → Grades a student's answer (0–10) and provides feedback
 *
 *  - generateFinalFeedback(messages, topicTitle)
 *      → Returns a paragraph summary of the student's overall viva performance
 *
 * Uses gemini-1.5-flash model for speed at hackathon scale.
 */

const GEMINI_MODEL = 'gemini-1.5-flash';

const callGemini = async (systemInstruction, userPrompt) => {
  const url = `${process.env.GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error('Gemini returned an empty response.');

  try {
    return JSON.parse(rawText);
  } catch {
    // If JSON parsing fails, return raw text wrapped in an object
    return { raw: rawText };
  }
};

// --- Public Service Methods ---

export const generateProjectIdea = async (topicTitle, difficulty = 'EASY') => {
  const system = `You are a senior software engineering mentor. 
  Output ONLY valid JSON. No markdown. No explanation outside the JSON.
  Schema: { "title": string, "description": string, "starterCode": string, 
            "subtasks": [{order: number, title: string, description: string}],
            "testCases": [{input: string, expectedOutput: string}] }`;

  const prompt = `Generate a beginner project for the DSA topic "${topicTitle}" at ${difficulty} difficulty.
  The project should apply the concept practically. Include 3–4 subtasks and 2 test cases.
  Starter code should be in Python with TODO comments.`;

  return await callGemini(system, prompt);
};

export const startViva = async (code, topicTitle, language = 'English') => {
  const system = `You are a strict but encouraging technical interviewer conducting a Viva Voce.
  You have just read a student's code. Ask ONE short, specific question about their code logic.
  Ask about a specific line, variable name, or algorithm choice.
  Output ONLY valid JSON. Schema: { "question": string }`;

  const prompt = `Topic: "${topicTitle}". Language of student: ${language}.
  Student's code:
  \`\`\`
  ${code.slice(0, 1500)}
  \`\`\`
  Ask one focused question about this specific implementation.`;

  return await callGemini(system, prompt);
};

export const evaluateAnswer = async (code, question, studentAnswer, topicTitle) => {
  const system = `You are a technical interviewer grading a student's viva answer.
  Be objective and concise. Score 0–10 based on accuracy and understanding.
  Output ONLY valid JSON. Schema: { "score": number, "feedback": string, "nextQuestion": string | null }
  Set nextQuestion to null if this should be the last question.`;

  const prompt = `Topic: "${topicTitle}"
  Code submitted:
  \`\`\`
  ${code.slice(0, 1000)}
  \`\`\`
  Question asked: "${question}"
  Student's answer: "${studentAnswer}"
  Evaluate the answer. Provide a score (0–10) and brief feedback. 
  If a follow-up question is warranted, include it in nextQuestion. Otherwise set to null.`;

  return await callGemini(system, prompt);
};

export const generateFinalFeedback = async (messages, topicTitle) => {
  const system = `You are a senior engineering mentor writing a performance summary.
  Output ONLY valid JSON. Schema: { "summary": string, "strengths": [string], "improvements": [string] }`;

  const transcript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  const prompt = `Topic: "${topicTitle}". Here is the full viva transcript:
  ${transcript}
  Write a 2–3 sentence performance summary, list 2 strengths and 2 improvement areas.`;

  return await callGemini(system, prompt);
};
