/**
 * src/services/apiClient.ts
 * Centralized HTTP client for all API interactions
 */

import { API_CONFIG } from '../config';
import { PrayogShalaError } from '../types';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    const savedToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (savedToken) {
      this.setToken(savedToken);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
      this.defaultHeaders = {
        ...this.defaultHeaders,
        Authorization: `Bearer ${token}`,
      };
    } else {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const headers = { ...this.defaultHeaders };
      delete headers['Authorization'];
      this.defaultHeaders = headers;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.setToken(null);
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ).toString();
      if (queryString) url += `?${queryString}`;
    }

    return url;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: unknown;
      headers?: HeadersInit;
      params?: Record<string, string | number>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', data, headers = {}, params } = options;

    const url = this.buildUrl(endpoint, params);
    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      timeout: API_CONFIG.REQUEST_TIMEOUT,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.clearToken();
        throw new PrayogShalaError(
          'Unauthorized. Please login again.',
          401,
          'UNAUTHORIZED'
        );
      }

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const message = responseData?.message || 'An error occurred';
        throw new PrayogShalaError(
          message,
          response.status,
          responseData?.code,
          responseData
        );
      }

      return (responseData?.data || responseData) as T;
    } catch (error) {
      if (error instanceof PrayogShalaError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new PrayogShalaError(
          'Network error. Please check your connection.',
          0,
          'NETWORK_ERROR'
        );
      }

      throw new PrayogShalaError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, data?: unknown, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data, params });
  }

  put<T>(endpoint: string, data?: unknown, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data, params });
  }

  delete<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }

  patch<T>(endpoint: string, data?: unknown, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data, params });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
