/**
 * src/types/skill.ts
 * SkillReport and ProfileProgress-related TypeScript interfaces
 * 
 * Backend Integration Notes:
 * - SkillReport aggregates scores from submission, viva, and validation quiz
 * - ProfileProgress tracks user's learning journey and achievements
 * - CertificateId links to generated certificates in storage
 * - Reports are immutable once generated (no updates allowed)
 */

import { Submission } from './submission';
import { VivaSession } from './viva';
import { Topic } from './module';
import { User, Language } from './user';

/**
 * Breakdown of scores from different evaluation methods
 * Backend: Calculated during SkillReport generation
 */
export interface ScoreBreakdown {
  conceptValidation: number;
  codeExecution: number;
  vivaScore: number;
}

/**
 * SkillReport represents comprehensive evaluation for a topic
 * Backend Endpoint: POST /api/skill-reports, GET /api/skill-reports/:id
 * Certificate Generation: certificateId references PDF in storage
 */
export interface SkillReport {
  _id: string;
  user: string | User;
  topic: string | Topic;
  submission: string | Submission;
  viva: string | VivaSession;
  overallScore: number;
  breakdown: ScoreBreakdown;
  certificateId: string;
  languageUsed: Language;
  isVerified: boolean;
  issuedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * ProfileProgress tracks user's overall learning statistics
 * Backend Endpoint: GET /api/users/:id/progress
 */
export interface ProfileProgress {
  _id: string;
  user: string | User;
  totalTopicsStarted: number;
  totalTopicsCompleted: number;
  totalXpEarned: number;
  currentLevel: number;
  averageScore: number;
  skillReports: string[] | SkillReport[];
  completedTopics: string[];
  inProgressTopics: string[];
  achievementBadges: Badge[];
  learningStreak: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Badge represents an achievement earned by user
 * Backend: Awarded based on completion milestones and performance
 */
export interface Badge {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  category: 'completion' | 'performance' | 'streak' | 'special';
  awardedAt: string;
}
