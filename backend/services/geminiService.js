import { fetchWithTimeout, memoize } from '../utils/fetchWithTimeout.js';

const GEMINI_BASE = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const _callGemini = async (systemInstruction, userPrompt) => {
  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    }),
  }, 15000);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) {
    throw new Error('Gemini returned empty response');
  }

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // not valid JSON
    }
  }

  return { raw };
};

const callGemini = memoize(_callGemini);

export const generateProjectIdea = async (topicTitle, difficulty = 'EASY') => {
  const systemInstruction = `You are a senior software engineering mentor who designs REAL-WORLD MINI APPLICATIONS, not DSA algorithm problems.
Output ONLY valid JSON.

CRITICAL RULES:
- NEVER generate DSA problems (Two Sum, Reverse Linked List, etc.)
- NEVER generate algorithm coding challenges
- ALWAYS generate a real-world mini application a beginner could build
- The starter code should set up a small app, not a function stub for an algorithm

Schema:
{
  "title": "project title",
  "description": "detailed project description (2-3 sentences)",
  "learningObjectives": ["objective 1", "objective 2", "objective 3"],
  "skillsCovered": ["skill 1", "skill 2", "skill 3"],
  "starterCode": "multi-line starter code for a small application",
  "subtasks": [
    { "order": 1, "title": "subtask title", "description": "what to do" }
  ],
  "testCases": [
    { "input": "test input", "expectedOutput": "expected output", "isHidden": false }
  ]
}`;

  const userPrompt = `Generate a ${difficulty}-difficulty REAL-WORLD MINI APPLICATION for the concept: "${topicTitle}".

STRICT RULES - READ CAREFULLY:
1. This MUST be a practical, real-world mini application — NOT a DSA/algorithm problem
2. NO coding challenges (no "Two Sum", "Valid Parentheses", "Reverse Linked List", etc.)
3. NO algorithm problems disguised as projects

GOOD examples (match the concept to a real app):
- "Arrays" → CLI To-Do List Manager, Contact Book, Shopping List App
- "Strings" → Markdown Previewer, Text Analyzer, Password Generator
- "Sorting" → File Sorter, Leaderboard App, Music Playlist Organizer
- "OOP" → Library Management, Bank Account Simulator, Student Grade Tracker
- "Trees" → File Explorer, Organization Chart, Comment Thread Viewer
- "Graphs" → Social Network Follower Map, Route Planner, Wiki Link Navigator
- "Recursion" → Directory Tree Printer, Fractal Drawer, Puzzle Solver
- "Dynamic Programming" → Budget Optimizer, Route Cost Calculator, Resource Allocator

The project should:
- Be a REAL mini application that serves a practical purpose
- Have a clear, engaging title
- Include a 2-3 sentence description
- List 3-5 specific learning objectives
- List 2-4 skills the project covers
- Include starter code (Python) setting up the app scaffold with placeholder functions
- Break work into 3-4 ordered subtasks
- Provide 2-3 test cases (at least 1 hidden)

Respond ONLY with valid JSON matching the schema above.`;

  const result = await callGemini(systemInstruction, userPrompt);

  return {
    title: result.title || `${topicTitle} Practice Project`,
    description: result.description || `A ${difficulty.toLowerCase()} project to practice ${topicTitle}.`,
    learningObjectives: result.learningObjectives || [],
    skillsCovered: result.skillsCovered || [],
    starterCode: result.starterCode || '',
    subtasks: Array.isArray(result.subtasks) ? result.subtasks : [],
    testCases: Array.isArray(result.testCases) ? result.testCases : [],
  };
};

export const generateMilestones = async (
  projectTitle,
  projectDescription,
  numberOfMilestones = 5,
  difficulty = 'MEDIUM'
) => {
  const systemInstruction = `You are a senior project manager. Output ONLY valid JSON.
Schema:
{
  "milestones": [
    {
      "title": "milestone title",
      "description": "what to achieve",
      "order": 1,
      "isRequired": true,
      "estimatedDays": 2,
      "deliverables": ["deliverable 1", "deliverable 2"],
      "subtasks": ["subtask 1", "subtask 2"]
    }
  ],
  "subtasks": [
    { "order": 1, "title": "subtask title", "description": "what to do", "isRequired": true }
  ],
  "completionChecklist": [
    "checklist item 1",
    "checklist item 2",
    "checklist item 3"
  ]
}`;

  const userPrompt = `Generate ${numberOfMilestones} milestones for the ${difficulty} project: "${projectTitle}".
Description: ${projectDescription}

For each milestone include:
- title, description, order, isRequired flag, estimatedDays, deliverables, and specific subtask steps

Also generate:
- A flat list of 6-10 ordered subtasks covering the entire project
- A completion checklist of 5-8 items the student must verify before marking the project done

Requirements:
- 60-70% of milestones should be required
- Order milestones progressively (1 to ${numberOfMilestones})
- estimatedDays should be realistic for ${difficulty} difficulty
- subtasks must be concrete and actionable

Respond ONLY with valid JSON matching the schema above.`;

  const result = await callGemini(systemInstruction, userPrompt);
  const milestones = Array.isArray(result?.milestones) ? result.milestones : [];

  return {
    milestones: milestones.map((m, i) => ({
      title: m.title || `Milestone ${i + 1}`,
      description: m.description || '',
      order: m.order || i + 1,
      isRequired: m.isRequired !== undefined ? m.isRequired : i < Math.ceil(numberOfMilestones * 0.65),
      estimatedDays: m.estimatedDays || Math.max(1, i + 1),
      deliverables: Array.isArray(m.deliverables) ? m.deliverables : [],
      subtasks: Array.isArray(m.subtasks) ? m.subtasks : [],
    })),
    subtasks: Array.isArray(result?.subtasks)
      ? result.subtasks.map((s, i) => ({
          order: s.order || i + 1,
          title: s.title || `Subtask ${i + 1}`,
          description: s.description || '',
          isRequired: s.isRequired !== undefined ? s.isRequired : true,
        }))
      : [],
    completionChecklist: Array.isArray(result?.completionChecklist) ? result.completionChecklist : [],
  };
};
