/**
 * src/services/authService.ts
 * Authentication service for login, register, logout, and user profile management
 * All authentication operations go through this centralized service
 * 
 * TODO: Connect MongoDB Atlas for user persistence
 * TODO: Implement JWT token refresh logic
 * TODO: Add session management and token expiration handling
 * TODO: Implement password reset flow
 * TODO: Add email verification for registration
 * TODO: Implement role-based access control (RBAC)
 * 
 * Backend Integration:
 * - POST /api/auth/login - authenticate user
 * - POST /api/auth/register - create new user account
 * - GET /api/auth/me - get current user profile
 * - PUT /api/auth/profile - update user profile
 * - POST /api/auth/logout - clear session
 * - POST /api/auth/refresh - refresh JWT token
 */

import apiClient from './apiClient';
import { API_CONFIG } from '../config';
import {
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../types';

class AuthService {
  /**
   * Login with email and password
   * Backend Endpoint: POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      // TODO: Validate email format and password strength
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH_LOGIN,
        payload
      );
      
      // TODO: Validate response contains token and user data
      // TODO: Implement token expiration tracking
      if (response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem(
          API_CONFIG.STORAGE_KEYS.USER,
          JSON.stringify(response.user)
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user account
   * Backend Endpoint: POST /api/auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      // TODO: Validate email uniqueness on backend
      // TODO: Implement email verification before account activation
      // TODO: Hash password on backend using bcrypt
      // TODO: Send welcome email to new user
      
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH_REGISTER,
        payload
      );

      if (response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem(
          API_CONFIG.STORAGE_KEYS.USER,
          JSON.stringify(response.user)
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user profile from backend
   * Backend Endpoint: GET /api/auth/me
   */
  async getCurrentUser(): Promise<User> {
    try {
      // TODO: Validate token before making request
      // TODO: Handle 401 unauthorized response
      
      const user = await apiClient.get<User>(API_CONFIG.ENDPOINTS.AUTH_ME);
      localStorage.setItem(
        API_CONFIG.STORAGE_KEYS.USER,
        JSON.stringify(user)
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * Backend Endpoint: PUT /api/auth/profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      // TODO: Validate update payload
      // TODO: Prevent unauthorized field modifications
      // TODO: Sync with backend user model
      
      const user = await apiClient.put<User>(
        API_CONFIG.ENDPOINTS.AUTH_UPDATE,
        updates
      );
      localStorage.setItem(
        API_CONFIG.STORAGE_KEYS.USER,
        JSON.stringify(user)
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout and clear authentication
   */
  logout(): void {
    // TODO: Call backend logout endpoint to invalidate token
    apiClient.clearToken();
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // TODO: Validate token expiration
    // TODO: Check if token is still valid on backend
    
    const token = apiClient.getToken();
    const user = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
    return !!(token && user);
  }

  /**
   * Get cached user from localStorage
   */
  getCachedUser(): User | null {
    const user = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Refresh authentication token
   * Backend Endpoint: POST /api/auth/refresh
   */
  async refreshToken(): Promise<string> {
    try {
      // TODO: Connect to refresh token endpoint
      // TODO: Handle refresh token rotation
      // TODO: Update stored token with new one
      
      const response = await apiClient.post<{ token: string }>(
        `${API_CONFIG.ENDPOINTS.AUTH}/refresh`
      );
      
      if (response.token) {
        apiClient.setToken(response.token);
      }
      
      return response.token;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   * Backend Endpoint: POST /api/auth/forgot-password
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // TODO: Connect to password reset endpoint
      // TODO: Implement email sending with reset link
      // TODO: Store reset token with expiration
      
      await apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/forgot-password`, { email });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   * Backend Endpoint: POST /api/auth/reset-password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // TODO: Validate reset token
      // TODO: Hash new password on backend
      // TODO: Invalidate old sessions
      
      await apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/reset-password`, {
        token,
        newPassword,
      });
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
