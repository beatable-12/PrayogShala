/**
 * src/types/project.ts
 * Project and Milestone-related TypeScript interfaces
 * 
 * Backend Integration Notes:
 * - Projects are generated using Gemini API based on topic concepts
 * - Milestones are generated for project completion tracking
 * - Store project specs and milestone data in MongoDB
 */

import { Subtask, TestCase, Topic } from './module';
import { User } from './user';

/**
 * Project represents a complete coding project assignment
 * Backend Endpoint: POST /api/projects/generate (uses Gemini API)
 */
export interface Project {
  _id: string;
  topic: string | Topic;
  user: string | User;
  title: string;
  description: string;
  starterCode: string;
  subtasks: Subtask[];
  testCases: TestCase[];
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * ProjectSpec defines project structure for generation
 * Backend: Used as input for Gemini project generation
 */
export interface ProjectSpec {
  title: string;
  description: string;
  starterCode: string;
  subtasks: Subtask[];
  testCases: TestCase[];
}

/**
 * Milestone represents a checkpoint in project completion
 * Backend: Generated using Gemini API based on project requirements
 */
export interface Milestone {
  _id: string;
  project: string | Project;
  title: string;
  description: string;
  order: number;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from milestone generation endpoint
 * Backend Endpoint: POST /api/milestones/generate
 */
export interface MilestoneGenerationResponse {
  milestones: {
    title: string;
    description: string;
    order: number;
    isRequired: boolean;
  }[];
}
