/**
 * Centralized API Client
 * Handles all HTTP requests with fallback to mock data
 */

import { API_CONFIG, isDemoMode, getApiBaseUrl } from './config';

interface RequestOptions extends RequestInit {
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
  fromMock?: boolean;
}

/**
 * Simulate network delay for mock responses
 */
export const simulateDelay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create a fetch request with timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestOptions = {}
): Promise<Response> => {
  const { timeout = API_CONFIG.TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  const user = localStorage.getItem('hseb5_current_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      return parsed.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Build headers for API requests
 */
const buildHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Main API client for making HTTP requests
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'GET',
      headers: buildHeaders(options?.headers),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      headers: buildHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'PATCH',
      headers: buildHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'PUT',
      headers: buildHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * DELETE request
   */
  async delete<T = void>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'DELETE',
      headers: buildHeaders(options?.headers),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Some DELETE requests don't return data
    const text = await response.text();
    return text ? JSON.parse(text) : (undefined as T);
  },

  /**
   * Upload file(s) with FormData
   */
  async upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    
    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - browser sets it with boundary

    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * Download file as Blob
   */
  async download(endpoint: string, options?: RequestOptions): Promise<Blob> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'GET',
      headers: buildHeaders(options?.headers),
    });

    if (!response.ok) {
      throw new Error(`Download failed: HTTP ${response.status}`);
    }

    return response.blob();
  },
};

/**
 * Wrapper that tries API first, then falls back to mock
 */
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  mockCall: () => Promise<T>,
  options: { forceMock?: boolean } = {}
): Promise<T> {
  // If demo mode or force mock, use mock directly
  if (isDemoMode() || options.forceMock) {
    await simulateDelay();
    return mockCall();
  }

  // Try API first
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API call failed, falling back to mock data:', error);
    await simulateDelay();
    return mockCall();
  }
}
