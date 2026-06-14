/**
 * src/useAuthStore.ts
 * Zustand store for authentication state
 * Replaces local state management scattered across components
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthStore, User, LoginPayload, RegisterPayload } from '../types';
import { authService } from '../services/authService';

export const useAuthStore = create<AuthStore>(
  devtools(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login with email and password
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Register new user
       */
      register: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(payload);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Logout
       */
      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      /**
       * Set user data
       */
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      /**
       * Set error message
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'auth-store' }
  )
);

// Hydrate store on app load
export const initializeAuthStore = async () => {
  try {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      const user = await authService.getCurrentUser();
      useAuthStore.setState({
        user,
        token: authService.authService?.getToken?.() || null,
        isAuthenticated: true,
      });
    }
  } catch (error) {
    console.error('Failed to initialize auth store:', error);
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }
};

export default useAuthStore;

