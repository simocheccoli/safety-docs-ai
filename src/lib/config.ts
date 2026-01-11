/**
 * Application configuration
 * Reads from environment variables with fallback defaults
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  // Enable demo mode if API is not available or explicitly set
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true' || true,
};

// OpenAI Configuration
export const OPENAI_CONFIG = {
  API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'DVR Management',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

// Helper to check if we're in demo mode
export const isDemoMode = (): boolean => {
  return API_CONFIG.DEMO_MODE;
};

// Helper to get API base URL
export const getApiBaseUrl = (): string => {
  return API_CONFIG.BASE_URL;
};
