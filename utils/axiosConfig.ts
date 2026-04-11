/**
 * Axios Global Configuration and Interceptors
 * Sets up request/response interceptors for standardized error handling and request management
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { isRequestCancelled, normalizeError } from "./apiError";
import { API_TIMEOUT_MS } from "./constants";

/**
 * Configure axios instance with interceptors for:
 * - Standardized error handling
 * - Request logging
 * - Timeout handling (15 seconds)
 * - Response normalization
 */
export function configureAxios(): AxiosInstance {
  const instance = axios.create({
    timeout: API_TIMEOUT_MS, // 15 second timeout
  });

  /**
   * Request Interceptor
   * - Add global headers
   * - Log outgoing requests
   */
  instance.interceptors.request.use(
    (config) => {
      // Add default headers
      if (!config.headers) {
        config.headers = {} as any;
      }

      // Request has been initiated
      config.headers["X-Request-ID"] = generateRequestId();

      // Log outgoing request in development
      if (__DEV__) {
        console.debug("[API Request]", {
          method: config.method?.toUpperCase(),
          url: config.url,
          timestamp: new Date().toISOString(),
        });
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  /**
   * Response Interceptor
   * - Handle success responses
   * - Log responses
   * - Standardize error handling
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful response in development
      if (__DEV__) {
        console.debug("[API Response]", {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          timestamp: new Date().toISOString(),
        });
      }

      return response;
    },
    (error: AxiosError) => {
      // Don't treat cancellations as errors
      if (isRequestCancelled(error)) {
        return Promise.reject(error);
      }

      // Log errors in development
      if (__DEV__) {
        const normalized = normalizeError(error);
        console.error("[API Error]", {
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          status: error.response?.status,
          message: normalized.message,
          isNetworkError: normalized.isNetworkError,
          isTimeout: normalized.isTimeout,
          timestamp: new Date().toISOString(),
        });
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * Default axios instance with interceptors configured
 */
let defaultInstance: AxiosInstance | null = null;

/**
 * Get or create the default configured axios instance
 */
export function getAxiosInstance(): AxiosInstance {
  if (!defaultInstance) {
    defaultInstance = configureAxios();
  }
  return defaultInstance;
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Reset axios instance (mainly for testing)
 */
export function resetAxiosInstance(): void {
  defaultInstance = null;
}
