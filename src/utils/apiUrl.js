/**
 * Resolve API base URL from environment with localhost fallback.
 */
export function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
}
