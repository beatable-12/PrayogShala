/**
 * src/types/module.ts
 * Module and Topic-related TypeScript interfaces
 * 
 * Backend Integration Notes:
 * - Module acts as a container for Topics
 * - Topics contain ValidationQuiz and ProjectTemplate
 * - All entities are persisted in MongoDB with _id as ObjectId
 */

export interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  totalLessons: number;
  estimatedHours: number;
  topics: string[] | Topic[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

/**
 * ValidationQuiz used for concept validation after reading topic content
 * Backend: Stored in Topic.validationQuiz
 */
export interface ValidationQuiz {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  type: 'mcq' | 'code-fill' | 'true-false';
}

/**
 * TestCase for code execution validation
 * Backend: Used for evaluating submitted code against expected outputs
 */
export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

/**
 * Subtask represents a part of a Project
 * Backend: Multiple subtasks can be grouped into a Project
 */
export interface Subtask {
  order: number;
  title: string;
  description: string;
  isRequired: boolean;
}

/**
 * ProjectTemplate defines the structure for a coding project
 * Backend: Stored in Topic.projectTemplate
 */
export interface ProjectTemplate {
  title: string;
  description: string;
  starterCode: string;
  language: ProgrammingLanguage;
  subtasks: Subtask[];
  testCases: TestCase[];
}

/**
 * Topic represents a learning unit within a Module
 * Backend Endpoint: GET /api/topics/:id, GET /api/modules/:id/topics
 */
export interface Topic {
  _id: string;
  module: string | Module;
  title: string;
  slug: string;
  conceptText: string;
  difficulty: Difficulty;
  xpReward: number;
  estimatedMinutes: number;
  validationQuiz: ValidationQuiz;
  projectTemplate: ProjectTemplate;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProgrammingLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c';
