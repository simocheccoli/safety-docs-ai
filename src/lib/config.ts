/**
 * Application configuration
 * Reads from environment variables with fallback defaults
 */

// API Configuration
export const API_CONFIG = {
  // Backend uses /api/v1 prefix according to OpenAPI spec
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  API_PREFIX: '/api/v1',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  // DEMO_MODE disabilitato per usare le API reali
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',
};

// OpenAI Configuration
export const OPENAI_CONFIG = {
  API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'HSE B5 - Rischio Chimico',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

// Helper to check if we're in demo mode
export const isDemoMode = (): boolean => {
  return API_CONFIG.DEMO_MODE;
};

// Helper to get API base URL with prefix
export const getApiBaseUrl = (): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
};

// Helper to get just the base URL (without prefix)
export const getRawBaseUrl = (): string => {
  return API_CONFIG.BASE_URL;
};
