/**
 * src/types/user.ts
 * User-related TypeScript interfaces
 * 
 * Backend Integration Notes:
 * - _id: MongoDB ObjectId string format
 * - Sync with backend User model for role, language preferences
 * - Auth token should be stored securely in httpOnly cookies for production
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  preferredLang: Language;
  xp: number;
  unlockedTopics: string[];
  completedTopics: string[];
  createdAt: string;
  updatedAt: string;
}

export type Language = 
  | 'English' 
  | 'Hindi' 
  | 'Tamil' 
  | 'Telugu' 
  | 'Kannada' 
  | 'Bengali' 
  | 'Marathi';

/**
 * Authentication response from backend login/register endpoints
 * Backend Endpoint: POST /api/auth/login, POST /api/auth/register
 */
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

/**
 * Login request payload
 * Backend Endpoint: POST /api/auth/login
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Registration request payload
 * Backend Endpoint: POST /api/auth/register
 */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  preferredLang?: Language;
}
