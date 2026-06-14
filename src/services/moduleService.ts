/**
 * src/services/moduleService.ts
 * Service for fetching and managing learning modules
 * Handles module CRUD operations and user progress tracking
 * 
 * TODO: Connect MongoDB Atlas for module persistence
 * TODO: Implement module caching strategy
 * TODO: Add module popularity and completion analytics
 * TODO: Implement soft delete for modules (admin feature)
 * TODO: Add audit logging for module changes
 * 
 * Backend Integration:
 * - GET /api/modules - fetch all published modules
 * - GET /api/modules/:id - fetch single module with topics
 * - POST /api/modules - create module (admin only)
 * - PUT /api/modules/:id - update module (admin only)
 * - DELETE /api/modules/:id - delete module (admin only)
 * - GET /api/modules/:id/progress - get user progress in module
 * - GET /api/modules/:id/topics - get topics in module
 */

import apiClient from './apiClient';
import { API_CONFIG } from '../config';
import { Module, PaginatedResponse } from '../types';

class ModuleService {
  /**
   * Get all published modules with pagination
   * Backend Endpoint: GET /api/modules?page=1&limit=20&published=true
   */
  async getAllModules(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Module>> {
    try {
      // TODO: Implement pagination query parameters
      // TODO: Add filtering by difficulty and category
      // TODO: Cache results with TTL (time-to-live)
      
      const modules = await apiClient.get<Module[]>(
        API_CONFIG.ENDPOINTS.MODULES_LIST,
        { published: 1, page, limit }
      );
      return {
        data: modules,
        total: modules.length,
        page,
        limit,
        pages: Math.ceil(modules.length / limit),
      };
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      throw error;
    }
  }

  /**
   * Get module by ID with all topics
   * Backend Endpoint: GET /api/modules/:id
   */
  async getModuleById(moduleId: string): Promise<Module> {
    try {
      // TODO: Implement response caching
      // TODO: Validate moduleId format
      // TODO: Include user progress if authenticated
      
      const module = await apiClient.get<Module>(
        API_CONFIG.ENDPOINTS.MODULES_GET.replace(':id', moduleId)
      );
      return module;
    } catch (error) {
      console.error(`Failed to fetch module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Create new module (admin only)
   * Backend Endpoint: POST /api/modules
   */
  async createModule(moduleData: Partial<Module>): Promise<Module> {
    try {
      // TODO: Validate moduleData schema
      // TODO: Check admin authorization on backend
      // TODO: Generate slug from title if not provided
      // TODO: Validate icon exists
      
      const module = await apiClient.post<Module>(
        API_CONFIG.ENDPOINTS.MODULES_CREATE,
        moduleData
      );
      return module;
    } catch (error) {
      console.error('Failed to create module:', error);
      throw error;
    }
  }

  /**
   * Update module (admin only)
   * Backend Endpoint: PUT /api/modules/:id
   */
  async updateModule(moduleId: string, updates: Partial<Module>): Promise<Module> {
    try {
      // TODO: Validate updates don't break existing topics
      // TODO: Check admin authorization on backend
      // TODO: Invalidate cache after update
      // TODO: Log changes for audit trail
      
      const module = await apiClient.put<Module>(
        API_CONFIG.ENDPOINTS.MODULES_UPDATE.replace(':id', moduleId),
        updates
      );
      return module;
    } catch (error) {
      console.error(`Failed to update module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Delete module (admin only)
   * Backend Endpoint: DELETE /api/modules/:id
   */
  async deleteModule(moduleId: string): Promise<{ success: boolean }> {
    try {
      // TODO: Check admin authorization on backend
      // TODO: Implement soft delete to preserve data
      // TODO: Update all users with deleted module in progress
      // TODO: Log deletion for audit trail
      
      const result = await apiClient.delete<{ success: boolean }>(
        API_CONFIG.ENDPOINTS.MODULES_DELETE.replace(':id', moduleId)
      );
      return result;
    } catch (error) {
      console.error(`Failed to delete module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get module progress for current user
   * Backend Endpoint: GET /api/modules/:id/progress
   */
  async getModuleProgress(moduleId: string): Promise<{
    totalTopics: number;
    completedTopics: number;
    percentComplete: number;
  }> {
    try {
      // TODO: Connect to backend progress endpoint
      // TODO: Calculate completion percentage based on topic submissions
      // TODO: Include estimated time remaining
      
      const progress = await apiClient.get<{
        totalTopics: number;
        completedTopics: number;
        percentComplete: number;
      }>(`${API_CONFIG.ENDPOINTS.MODULES_GET.replace(':id', moduleId)}/progress`);
      
      return progress;
    } catch (error) {
      console.error(`Failed to fetch module progress for ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get modules by difficulty level
   * Backend Endpoint: GET /api/modules?difficulty=EASY
   */
  async getModulesByDifficulty(difficulty: string): Promise<Module[]> {
    try {
      // TODO: Add difficulty filter parameter to endpoint
      
      const modules = await apiClient.get<Module[]>(
        API_CONFIG.ENDPOINTS.MODULES_LIST,
        { difficulty, published: 1 }
      );
      return modules;
    } catch (error) {
      console.error(`Failed to fetch modules with difficulty ${difficulty}:`, error);
      throw error;
    }
  }

  /**
   * Search modules by title or description
   * Backend Endpoint: GET /api/modules/search?q=keyword
   */
  async searchModules(query: string): Promise<Module[]> {
    try {
      // TODO: Connect to full-text search endpoint
      // TODO: Implement relevance scoring
      // TODO: Add autocomplete suggestions
      
      const modules = await apiClient.get<Module[]>(
        `${API_CONFIG.ENDPOINTS.MODULES_LIST}/search`,
        { q: query }
      );
      return modules;
    } catch (error) {
      console.error(`Failed to search modules with query "${query}":`, error);
      throw error;
    }
  }
}

export const moduleService = new ModuleService();
export default moduleService;
