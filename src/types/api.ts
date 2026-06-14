/**
 * src/types/api.ts
 * API request/response wrapper and utility types
 * 
 * Backend Integration Notes:
 * - All API responses follow ApiResponse<T> wrapper format
 * - Errors include status codes and detailed error information
 * - PaginatedResponse used for list endpoints
 */

/**
 * Generic API response wrapper for all backend endpoints
 * Backend: All endpoints should return this format
 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Paginated API response for list endpoints
 * Backend Endpoint: GET /api/topics, GET /api/submissions, etc. (with pagination params)
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * API error structure for error responses
 * Backend: Used in error handling and logging
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
