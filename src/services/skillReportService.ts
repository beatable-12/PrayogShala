/**
 * src/services/skillReportService.ts
 * Service for skill reports and certifications
 * Generates comprehensive digital credentials after completing full learning flow
 * 
 * TODO: Connect MongoDB Atlas for skill report persistence
 * TODO: Implement PDF certificate generation
 * TODO: Add social media sharing functionality
 * TODO: Implement skill profile aggregation
 * TODO: Add email notifications for certifications
 * 
 * Backend Integration:
 * - POST /api/skill-reports - generate skill report
 * - GET /api/skill-reports/:id - get skill report
 * - GET /api/skill-reports - list user's skill reports
 * - PATCH /api/skill-reports/:id/verify - verify skill report
 * - GET /api/skill-reports/:id/certificate - download certificate PDF
 * - POST /api/skill-reports/:id/share - generate share link
 * - GET /api/users/me/skills - get user skill profile
 */

import apiClient from './apiClient';
import { API_CONFIG } from '../config';
import { SkillReport, PaginatedResponse } from '../types';

class SkillReportService {
  /**
   * Generate skill report for a completed topic
   * Backend Endpoint: POST /api/skill-reports
   * 
   * Backend flow:
   * 1. Verify submission is accepted (code execution passed)
   * 2. Verify viva is completed and passed
   * 3. Aggregate scores:
   *    - Concept Validation: Quiz score
   *    - Code Execution: Test score from submission
   *    - Viva Score: Viva session score
   * 4. Calculate weighted overall score:
   *    - Quiz: 20%
   *    - Code: 40%
   *    - Viva: 40%
   * 5. Generate unique certificate ID
   * 6. Mark as verified if score >= 60
   * 7. Store in MongoDB
   * 8. Return skill report
   */
  async generateReport(submissionId: string, vivaId: string): Promise<SkillReport> {
    try {
      // TODO: Validate both submission and viva are complete
      // TODO: Implement score weighting calculation
      // TODO: Generate certificate ID
      
      const report = await apiClient.post<SkillReport>(
        API_CONFIG.ENDPOINTS.REPORTS_GENERATE,
        {
          submissionId,
          vivaId,
        }
      );
      return report;
    } catch (error) {
      console.error('Failed to generate skill report:', error);
      throw error;
    }
  }

  /**
   * Get skill report by ID
   * Backend Endpoint: GET /api/skill-reports/:id
   */
  async getReportById(reportId: string): Promise<SkillReport> {
    try {
      // TODO: Include related submission and viva data
      
      const report = await apiClient.get<SkillReport>(
        API_CONFIG.ENDPOINTS.REPORTS_GET.replace(':id', reportId)
      );
      return report;
    } catch (error) {
      console.error(`Failed to fetch skill report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Get all skill reports for current user with pagination
   * Backend Endpoint: GET /api/skill-reports?page=1&limit=10
   */
  async getUserReports(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SkillReport>> {
    try {
      // TODO: Add filtering by topic, date range
      // TODO: Add sorting options (by score, date)
      
      const response = await apiClient.get<any>(
        API_CONFIG.ENDPOINTS.REPORTS_LIST,
        { page, limit }
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch skill reports:', error);
      throw error;
    }
  }

  /**
   * Verify skill report (mark as verified)
   * Backend Endpoint: PATCH /api/skill-reports/:id/verify
   * Used for displaying certificate badge
   */
  async verifyReport(reportId: string): Promise<SkillReport> {
    try {
      // TODO: Admin-only operation
      // TODO: Validate scores before verification
      
      const report = await apiClient.patch<SkillReport>(
        API_CONFIG.ENDPOINTS.REPORTS_VERIFY.replace(':id', reportId),
        {}
      );
      return report;
    } catch (error) {
      console.error(`Failed to verify skill report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Get all reports (admin only)
   * Backend Endpoint: GET /api/skill-reports?all=1
   */
  async getAllReports(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SkillReport>> {
    try {
      // TODO: Admin authorization check
      
      const response = await apiClient.get<any>(
        API_CONFIG.ENDPOINTS.REPORTS_LIST,
        { page, limit, all: 1 }
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch all skill reports:', error);
      throw error;
    }
  }

  /**
   * Download certificate as PDF
   * Backend Endpoint: GET /api/skill-reports/:id/certificate
   * Response: PDF file
   */
  async downloadCertificate(reportId: string): Promise<Blob> {
    try {
      // TODO: Generate PDF certificate with custom template
      // TODO: Include user name, topic, score, issue date
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/skill-reports/${reportId}/certificate`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              API_CONFIG.STORAGE_KEYS.AUTH_TOKEN
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download certificate: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error(`Failed to download certificate for report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Generate shareable link for certificate
   * Backend Endpoint: POST /api/skill-reports/:id/share
   */
  async generateShareLink(reportId: string, platform: 'linkedin' | 'twitter' | 'email'): Promise<string> {
    try {
      // TODO: Generate unique shareable URL
      // TODO: Create public certificate view page
      // TODO: Pre-fill social media captions
      
      const response = await apiClient.post<{ shareUrl: string }>(
        `/api/skill-reports/${reportId}/share`,
        { platform }
      );
      return response.shareUrl;
    } catch (error) {
      console.error(
        `Failed to generate share link for report ${reportId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get user's skill profile (aggregated stats)
   * Backend Endpoint: GET /api/users/me/skills
   */
  async getUserSkillProfile(): Promise<{
    topicsCompleted: number;
    averageScore: number;
    certificatesEarned: number;
    totalXpEarned: number;
    streakDays: number;
    topicsByDifficulty: Record<string, number>;
  }> {
    try {
      // TODO: Connect to user skills aggregation endpoint
      
      const profile = await apiClient.get<any>('/api/users/me/skills');
      return profile;
    } catch (error) {
      console.error('Failed to fetch user skill profile:', error);
      throw error;
    }
  }

  /**
   * Get reports by topic
   * Backend Endpoint: GET /api/topics/:topicId/reports
   */
  async getTopicReports(topicId: string): Promise<SkillReport[]> {
    try {
      // TODO: Get all user's reports for a specific topic
      
      const reports = await apiClient.get<SkillReport[]>(
        `/api/topics/${topicId}/reports`
      );
      return reports;
    } catch (error) {
      console.error(`Failed to fetch reports for topic ${topicId}:`, error);
      throw error;
    }
  }

  /**
   * Export all certificates as ZIP
   * Backend Endpoint: GET /api/skill-reports/export/certificates
   */
  async exportAllCertificates(): Promise<Blob> {
    try {
      // TODO: Generate ZIP file containing all certificates
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/skill-reports/export/certificates`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              API_CONFIG.STORAGE_KEYS.AUTH_TOKEN
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to export certificates: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export all certificates:', error);
      throw error;
    }
  }
}

export const skillReportService = new SkillReportService();
export default skillReportService;
