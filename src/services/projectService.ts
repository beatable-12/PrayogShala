/**
 * src/services/projectService.ts
 * Service for project generation using Gemini AI
 * Generates project specs and milestones based on topics
 * 
 * TODO: Connect Google Gemini API for project generation
 * TODO: Connect MongoDB Atlas for project persistence
 * TODO: Implement project template validation
 * TODO: Add project completion tracking
 * TODO: Implement milestone achievement notifications
 * 
 * Backend Integration:
 * - POST /api/projects/generate - generate project with Gemini
 * - POST /api/projects/:id/milestones - generate milestones with Gemini
 * - POST /api/projects/:id/suggestions - get AI code suggestions
 * - GET /api/topics/:topicId/project - get project template for topic
 * - GET /api/projects - list user's projects
 * - PUT /api/projects/:id - update project
 */

import apiClient from './apiClient';
import { API_CONFIG } from '../config';
import {
  ProjectSpec,
  GeminiProjectResponse,
  MilestoneGenerationResponse,
  Difficulty,
  Project,
  Milestone,
} from '../types';

class ProjectService {
  /**
   * Generate project idea using Gemini AI
   * Backend Endpoint: POST /api/projects/generate
   */
  async generateProjectIdea(
    topicTitle: string,
    difficulty: Difficulty = 'EASY'
  ): Promise<ProjectSpec> {
    try {
      // TODO: Connect to Gemini API for project generation
      // TODO: Validate difficulty parameter
      // TODO: Ensure response matches ProjectSpec schema
      // TODO: Implement response caching for same inputs
      
      const response = await apiClient.post<GeminiProjectResponse>(
        '/api/projects/generate',
        {
          topicTitle,
          difficulty,
        }
      );

      // Transform response to ProjectSpec
      return {
        title: response.title,
        description: response.description,
        starterCode: response.starterCode,
        subtasks: response.subtasks,
        testCases: response.testCases,
      };
    } catch (error) {
      console.error('Failed to generate project idea:', error);
      throw error;
    }
  }

  /**
   * Generate milestones for a project
   * Backend Endpoint: POST /api/projects/:projectId/milestones
   */
  async generateMilestones(projectId: string): Promise<Milestone[]> {
    try {
      // TODO: Connect to Gemini API for milestone generation
      // TODO: Ensure milestones are achievable and ordered
      // TODO: Mix required and optional milestones
      
      const response = await apiClient.post<MilestoneGenerationResponse>(
        `/api/projects/${projectId}/milestones`,
        {}
      );
      return response.milestones.map((m, index) => ({
        _id: `${projectId}-milestone-${index}`,
        project: projectId,
        ...m,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to generate milestones:', error);
      throw error;
    }
  }

  /**
   * Get AI suggestions for completing a milestone
   * Backend Endpoint: POST /api/projects/:projectId/suggestions
   */
  async getCompletionSuggestions(
    projectId: string,
    code: string,
    milestoneIndex: number
  ): Promise<string[]> {
    try {
      // TODO: Connect to Gemini API for code analysis
      // TODO: Analyze code against milestone requirements
      // TODO: Provide actionable next steps
      
      const response = await apiClient.post<{ suggestions: string[] }>(
        `/api/projects/${projectId}/suggestions`,
        {
          code,
          milestoneIndex,
        }
      );
      return response.suggestions;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      throw error;
    }
  }

  /**
   * Get project template by topic ID
   * Backend Endpoint: GET /api/topics/:topicId/project
   */
  async getProjectTemplate(topicId: string): Promise<ProjectSpec> {
    try {
      // TODO: Validate topicId exists
      // TODO: Implement response caching
      
      const response = await apiClient.get<ProjectSpec>(
        `/api/topics/${topicId}/project`
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch project template for topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new project
   * Backend Endpoint: POST /api/projects
   */
  async createProject(projectData: Partial<Project>): Promise<Project> {
    try {
      // TODO: Validate project schema
      // TODO: Generate unique project ID
      
      const project = await apiClient.post<Project>('/api/projects', projectData);
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  /**
   * Get user's projects
   * Backend Endpoint: GET /api/projects?page=1&limit=10
   */
  async getUserProjects(page: number = 1, limit: number = 10): Promise<{
    projects: Project[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // TODO: Add filtering by status (in_progress, completed)
      
      const response = await apiClient.get<any>('/api/projects', { page, limit });
      return response;
    } catch (error) {
      console.error('Failed to fetch user projects:', error);
      throw error;
    }
  }

  /**
   * Get project by ID
   * Backend Endpoint: GET /api/projects/:id
   */
  async getProjectById(projectId: string): Promise<Project> {
    try {
      // TODO: Include milestones and progress
      
      const project = await apiClient.get<Project>(`/api/projects/${projectId}`);
      return project;
    } catch (error) {
      console.error(`Failed to fetch project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update project
   * Backend Endpoint: PUT /api/projects/:id
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      // TODO: Validate updates
      
      const project = await apiClient.put<Project>(
        `/api/projects/${projectId}`,
        updates
      );
      return project;
    } catch (error) {
      console.error(`Failed to update project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Complete a project
   * Backend Endpoint: PUT /api/projects/:id
   */
  async completeProject(projectId: string): Promise<Project> {
    try {
      // TODO: Verify all required milestones are completed
      
      const project = await apiClient.put<Project>(
        `/api/projects/${projectId}`,
        { status: 'completed' }
      );
      return project;
    } catch (error) {
      console.error(`Failed to complete project ${projectId}:`, error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
export default projectService;
