/**
 * src/types/error.ts
 * Error handling types and custom error classes
 * 
 * Backend Integration Notes:
 * - PrayogShalaError is the base error class for all application errors
 * - ApiError represents backend error responses
 * - Use consistent error codes for error handling and logging
 */

/**
 * API error structure for backend error responses
 * Backend: All error responses should include these fields
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Custom error class for PrayogShala application
 * Frontend: Throw this for consistent error handling
 */
export class PrayogShalaError extends Error {
  status: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PrayogShalaError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
