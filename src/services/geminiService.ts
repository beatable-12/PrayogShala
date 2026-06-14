/**
 * src/services/geminiService.ts
 * Google Gemini AI Service Contract — Project Generation & Milestone Generation.
 *
 * Service Contract Only — no API calls. All integration points marked TODO.
 *
 * Gemini Responsibilities:
 * 1. Project Generation — generate complete coding projects from topic concepts
 * 2. Milestone Generation — break projects into ordered, achievable milestones
 *
 * Integration Checklist:
 * TODO: Implement POST /api/projects/generate — ProjectGeneration
 * TODO: Implement POST /api/milestones/generate — MilestoneGeneration
 *
 * Infrastructure:
 * TODO: Connect Google Gemini API (generativelanguage.googleapis.com/v1beta)
 * TODO: Implement API key authentication via query parameter (?key=)
 * TODO: Engineer prompts for consistent JSON-structured output
 * TODO: Set responseMimeType to 'application/json' for native JSON mode
 * TODO: Configure temperature (default 0.4), maxOutputTokens (default 1024)
 * TODO: Implement response validation and fallback JSON parsing
 * TODO: Add retry logic with exponential backoff (max 3 retries)
 * TODO: Implement context management for multi-turn conversations
 * TODO: Add cost tracking and quota monitoring
 * TODO: Implement caching by prompt hash to avoid redundant generation
 * TODO: Add request timeout handling (default 30s for generation)
 */

import { GEMINI_CONFIG } from '../config';
import {
  ProjectGenerationRequest,
  GeminiProjectResponse,
  MilestoneGenerationRequest,
  MilestoneGenerationResponse,
} from '../types';

class GeminiService {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.baseUrl = GEMINI_CONFIG.BASE_URL;
    this.apiKey = GEMINI_CONFIG.API_KEY;
    this.model = GEMINI_CONFIG.MODEL;
  }

  // ======================================================================
  // RESPONSIBILITY 1: Project Generation
  // ======================================================================

  /**
   * Generate a complete coding project from a topic concept.
   *
   * Contract:
   * - Input: topic title, concept text, difficulty, estimated minutes, optional language
   * - Output: project title, description, starter code, subtasks, test cases
   *
   * Backend: POST /api/projects/generate
   *
   * Generates:
   *   - Project title and description aligned with the topic
   *   - Starter code template with TODOs for student implementation
   *   - 3-6 ordered subtasks covering the concept progressively
   *   - Minimum 3 test cases (mix of visible + hidden) for validation
   *
   * TODO: Call Gemini API: POST /v1/models/{model}:generateContent
   * TODO: Build system instruction with strict JSON output schema
   * TODO: Include difficulty-appropriate constraints in the prompt
   * TODO: Validate response contains all required fields (title, description, etc.)
   * TODO: Ensure starter code has correct syntax for the target language
   * TODO: Validate test cases are solvable and have correct expected outputs
   * TODO: Ensure subtask ordering is logical (foundation → advanced)
   * TODO: Implement caching by (topicTitle + difficulty) hash
   * TODO: Parse JSON response with fallback for malformed output
   * TODO: Validate response against GeminiProjectResponse schema
   */
  async generateProject(
    topicTitle: string,
    conceptText: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    estimatedMinutes: number,
    language?: string
  ): Promise<GeminiProjectResponse> {
    const request: ProjectGenerationRequest = {
      topicTitle, conceptText, difficulty, estimatedMinutes, language,
    };
    throw new Error(`TODO: generateProject — ${JSON.stringify(request)}`);
  }

  // ======================================================================
  // RESPONSIBILITY 2: Milestone Generation
  // ======================================================================

  /**
   * Break a project into ordered, achievable milestones.
   *
   * Contract:
   * - Input: project title, description, number of milestones, difficulty
   * - Output: ordered milestones with title, description, deliverables, time estimates
   *
   * Backend: POST /api/milestones/generate
   *
   * Generates:
   *   - Ordered milestones that build on each other (prerequisite → advanced)
   *   - Mix of required (60-70%) and optional milestones for flexibility
   *   - Realistic time estimates based on difficulty
   *   - Clear deliverables per milestone for progress tracking
   *
   * TODO: Call Gemini API: POST /v1/models/{model}:generateContent
   * TODO: Build system instruction with milestone schema specification
   * TODO: Ensure milestone ordering respects dependencies (ordered by order ASC)
   * TODO: Validate time estimates are realistic for the difficulty level
   * TODO: Ensure required/optional ratio (target: 60-70% required)
   * TODO: Make milestone descriptions clear, specific, and actionable
   * TODO: Handle large milestone sets (20+) for multi-week projects
   * TODO: Implement caching by (projectTitle + numberOfMilestones) hash
   * TODO: Parse and validate response against MilestoneGenerationResponse schema
   */
  async generateMilestones(
    projectTitle: string,
    projectDescription: string,
    numberOfMilestones: number = 5,
    difficulty?: string
  ): Promise<MilestoneGenerationResponse> {
    const request: MilestoneGenerationRequest = {
      projectTitle, projectDescription, numberOfMilestones, difficulty,
    };
    throw new Error(`TODO: generateMilestones — ${JSON.stringify(request)}`);
  }
}

export const geminiService = new GeminiService();
export default geminiService;
