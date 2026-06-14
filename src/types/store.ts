/**
 * src/types/store.ts
 * State management (Zustand) store interfaces
 * 
 * Backend Integration Notes:
 * - AuthStore syncs with backend auth endpoints
 * - EditorStore is frontend-only for code editing state
 * - Store mutations should call corresponding backend APIs
 */

import { User, RegisterPayload } from './user';
import { ExecutionResult } from './submission';
import { ProgrammingLanguage } from './module';

/**
 * Auth store for user authentication state
 * Backend Integration: login() and register() call /api/auth endpoints
 */
export interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Editor store for code editor state
 * Backend Integration: None (frontend-only), except submission via API
 */
export interface EditorStore {
  code: string;
  language: ProgrammingLanguage;
  isDarkTheme: boolean;
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  output: string;
  errors: string;
  setCode: (code: string) => void;
  setLanguage: (language: ProgrammingLanguage) => void;
  setIsDarkTheme: (isDark: boolean) => void;
  setIsExecuting: (executing: boolean) => void;
  setExecutionResult: (result: ExecutionResult | null) => void;
  setOutput: (output: string) => void;
  setErrors: (errors: string) => void;
}
