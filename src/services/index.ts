/**
 * src/services/index.ts
 * Central export point for all service layer modules
 * 
 * Services:
 * - authService: User authentication and profile management
 * - moduleService: Learning module management and progress tracking
 * - topicService: Topic management with Sarvam AI integration
 * - projectService: Project generation with Gemini AI
 * - submissionService: Code submission and Judge0 execution
 * - judge0Service: Judge0 API integration for code execution
 * - sarvamService: Sarvam AI API for code analysis and translation
 * - geminiService: Google Gemini API for content generation
 * - vivaService: AI-powered viva session management
 * - skillReportService: Skill reports and certification management
 * - apiClient: Centralized HTTP client for all API calls
 */

export { authService, default as AuthService } from './authService';
export { moduleService, default as ModuleService } from './moduleService';
export { topicService, default as TopicService } from './topicService';
export { submissionService, default as SubmissionService } from './submissionService';
export { projectService, default as ProjectService } from './projectService';
export { judge0Service, default as Judge0Service } from './judge0Service';
export { sarvamService, default as SarvamService } from './sarvamService';
export { geminiService, default as GeminiService } from './geminiService';
export { vivaService, default as VivaService } from './vivaService';
export { skillReportService, default as SkillReportService } from './skillReportService';
export { apiClient, default as ApiClient } from './apiClient';
export { API_CONFIG, JUDGE0_CONFIG, SARVAM_CONFIG, GEMINI_CONFIG } from '../config';
