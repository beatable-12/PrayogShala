/**
 * src/services/topicService.ts
 * Service for topic management, concept explanations, and quiz validation
 * Integrates with Sarvam AI for multilingual concept explanations
 * 
 * TODO: Connect MongoDB Atlas for topic persistence
 * TODO: Connect Sarvam AI API for translations and TTS
 * TODO: Implement caching for concept explanations
 * TODO: Add topic completion tracking per user
 * TODO: Implement difficulty-based recommendations
 * 
 * Backend Integration:
 * - GET /api/topics - fetch all published topics
 * - GET /api/topics/:slug - fetch topic by slug
 * - POST /api/topics - create topic (admin only)
 * - PUT /api/topics/:id - update topic (admin only)
 * - DELETE /api/topics/:id - delete topic (admin only)
 * - POST /api/topics/:id/explain - generate explanation with Sarvam
 * - POST /api/topics/:id/speak - generate TTS with Sarvam
 * - POST /api/topics/:id/validate - validate quiz answer
 * - GET /api/topics/:id/hints - get learning hints
 */

import apiClient from './apiClient';
import { API_CONFIG } from '../config';
import { Topic, Language, TranslationResponse, TextToSpeechResponse, PaginatedResponse } from '../types';

class TopicService {
  /**
   * Get all published topics with pagination
   * Backend Endpoint: GET /api/topics?page=1&limit=20&published=true
   */
  async getAllTopics(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Topic>> {
    try {
      // TODO: Implement pagination and filtering
      const topics = await apiClient.get<Topic[]>(
        API_CONFIG.ENDPOINTS.TOPICS_LIST,
        { published: 1, page, limit }
      );
      return {
        data: topics,
        total: topics.length,
        page,
        limit,
        pages: Math.ceil(topics.length / limit),
      };
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      throw error;
    }
  }

  /**
   * Get topic by slug (URL-friendly identifier)
   * Backend Endpoint: GET /api/topics/:slug
   */
  async getTopicBySlug(slug: string): Promise<Topic> {
    try {
      // TODO: Implement slug-based fetching
      // TODO: Cache topic data with TTL
      
      const topic = await apiClient.get<Topic>(
        API_CONFIG.ENDPOINTS.TOPICS_GET_SLUG.replace(':slug', slug)
      );
      return topic;
    } catch (error) {
      console.error(`Failed to fetch topic ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get topic by ID
   * Backend Endpoint: GET /api/topics/:id
   */
  async getTopicById(topicId: string): Promise<Topic> {
    try {
      // TODO: Add response validation
      const topic = await apiClient.get<Topic>(
        `${API_CONFIG.ENDPOINTS.TOPICS_LIST}/${topicId}`
      );
      return topic;
    } catch (error) {
      console.error(`Failed to fetch topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Get AI explanation for concept in user's preferred language
   * Backend Endpoint: POST /api/topics/:id/explain
   * Uses Sarvam AI translation service
   */
  async explainConcept(topicId: string, language: Language): Promise<string> {
    try {
      // TODO: Connect to Sarvam API for translations
      // TODO: Implement response caching per language
      // TODO: Add fallback to English if translation fails
      
      const response = await apiClient.post<{ explanation: string }>(
        API_CONFIG.ENDPOINTS.TOPICS_EXPLAIN.replace(':id', topicId),
        { language }
      );
      return response.explanation;
    } catch (error) {
      console.error(`Failed to get explanation for topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Get text-to-speech audio for concept explanation
   * Backend Endpoint: POST /api/topics/:id/speak
   * Uses Sarvam AI TTS service
   */
  async speakConcept(topicId: string, language: Language, speed: number = 1.0): Promise<string> {
    try {
      // TODO: Connect to Sarvam text-to-speech API
      // TODO: Cache audio files to reduce API calls
      // TODO: Validate language support on backend
      
      const response = await apiClient.post<TextToSpeechResponse>(
        API_CONFIG.ENDPOINTS.TOPICS_SPEAK.replace(':id', topicId),
        { language, speed }
      );
      return response.audioBase64;
    } catch (error) {
      console.error(`Failed to get TTS for topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Validate answer to concept validation quiz
   * Backend Endpoint: POST /api/topics/:id/validate
   */
  async validateAnswer(topicId: string, answer: string): Promise<{
    isCorrect: boolean;
    feedback: string;
    explanation?: string;
    nextTopicSuggestion?: string;
  }> {
    try {
      // TODO: Implement case-insensitive and fuzzy matching
      // TODO: Use Gemini for intelligent answer evaluation if needed
      // TODO: Track quiz attempts per user
      
      const response = await apiClient.post<any>(
        API_CONFIG.ENDPOINTS.TOPICS_VALIDATE.replace(':id', topicId),
        { answer }
      );
      return response;
    } catch (error) {
      console.error(`Failed to validate answer for topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Create new topic (admin only)
   * Backend Endpoint: POST /api/topics
   */
  async createTopic(topicData: Partial<Topic>): Promise<Topic> {
    try {
      // TODO: Validate topic schema before sending
      // TODO: Generate slug from title if not provided
      // TODO: Check admin authorization on backend
      
      const topic = await apiClient.post<Topic>(
        API_CONFIG.ENDPOINTS.TOPICS_CREATE,
        topicData
      );
      return topic;
    } catch (error) {
      console.error('Failed to create topic:', error);
      throw error;
    }
  }

  /**
   * Update topic (admin only)
   * Backend Endpoint: PUT /api/topics/:id
   */
  async updateTopic(topicId: string, updates: Partial<Topic>): Promise<Topic> {
    try {
      // TODO: Validate updates don't break existing submissions
      // TODO: Check admin authorization on backend
      // TODO: Invalidate caches after update
      
      const topic = await apiClient.put<Topic>(
        API_CONFIG.ENDPOINTS.TOPICS_UPDATE.replace(':id', topicId),
        updates
      );
      return topic;
    } catch (error) {
      console.error(`Failed to update topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Delete topic (admin only)
   * Backend Endpoint: DELETE /api/topics/:id
   */
  async deleteTopic(topicId: string): Promise<{ success: boolean }> {
    try {
      // TODO: Check for existing submissions before deletion
      // TODO: Implement soft delete to preserve data
      // TODO: Check admin authorization on backend
      
      const result = await apiClient.delete<{ success: boolean }>(
        API_CONFIG.ENDPOINTS.TOPICS_DELETE.replace(':id', topicId)
      );
      return result;
    } catch (error) {
      console.error(`Failed to delete topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Get personalized learning hints
   * Backend Endpoint: GET /api/topics/:id/hints
   */
  async getHint(topicId: string): Promise<string> {
    try {
      // TODO: Use Gemini to generate personalized hints
      // TODO: Track which hints have been shown to avoid repetition
      // TODO: Implement hint difficulty progression
      
      const response = await apiClient.get<{ hint: string }>(
        `${API_CONFIG.ENDPOINTS.TOPICS_LIST}/${topicId}/hints`
      );
      return response.hint;
    } catch (error) {
      console.error(`Failed to get hints for topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Get topics by module
   * Backend Endpoint: GET /api/modules/:moduleId/topics
   */
  async getTopicsByModule(moduleId: string): Promise<Topic[]> {
    try {
      // TODO: Order topics by topic.order field
      const topics = await apiClient.get<Topic[]>(
        `/api/modules/${moduleId}/topics`
      );
      return topics;
    } catch (error) {
      console.error(`Failed to fetch topics for module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's progress on a topic
   * Backend Endpoint: GET /api/topics/:id/progress
   */
  async getTopicProgress(topicId: string): Promise<{
    hasStarted: boolean;
    hasCompleted: boolean;
    quizPassed: boolean;
    submissionScore?: number;
    vivaScore?: number;
  }> {
    try {
      // TODO: Connect to progress tracking endpoint
      
      const progress = await apiClient.get<any>(
        `${API_CONFIG.ENDPOINTS.TOPICS_LIST}/${topicId}/progress`
      );
      return progress;
    } catch (error) {
      console.error(`Failed to fetch progress for topic ${topicId}:`, error);
      throw error;
    }
  }
}

export const topicService = new TopicService();
export default topicService;
