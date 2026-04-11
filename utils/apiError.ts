import { NormalizedApiError } from "@/types/interface";

const createLogger = (context: string) => ({
  log: (msg: string, data?: any) => {
    console.log(`[${context}] ${msg}`, data || "");
  },
  debug: (msg: string, data?: any) => {
    console.debug(`[${context}] ${msg}`, data || "");
  },
  warn: (msg: string, data?: any) => {
    console.warn(`[${context}] ${msg}`, data || "");
  },
  error: (msg: string, data?: any) => {
    console.error(`[${context}] ${msg}`, data || "");
  },
});

const apiLogger = createLogger("API");

/**
 * Checks if an error is due to request cancellation
 * @param error - The error to check
 * @returns true if the request was cancelled
 */
export function isRequestCancelled(error: any): boolean {
  return (
    error?.code === "ERR_CANCELED" ||
    error?.name === "AbortError" ||
    error?.message === "canceled"
  );
}

/**
 * Checks if an error is a network error (no connection)
 * @param error - The error to check
 * @returns true if it's a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    !error?.response &&
    (error?.message === "Network Error" ||
      error?.code === "ERR_NETWORK" ||
      error?.message?.includes("Network") ||
      error?.message?.includes("ECONNREFUSED"))
  );
}

/**
 * Checks if an error is a timeout
 * @param error - The error to check
 * @returns true if it's a timeout error
 */
export function isTimeoutError(error: any): boolean {
  return error?.code === "ECONNABORTED" || error?.message?.includes("timeout");
}

/**
 * Gets human-readable error message
 * @param error - The error object
 * @param defaultMessage - Default message if unable to extract
 * @returns Error message string
 */
export function getErrorMessage(
  error: any,
  defaultMessage: string = "An error occurred",
): string {
  if (isRequestCancelled(error)) {
    return "Request was cancelled";
  }

  if (isNetworkError(error)) {
    return "Network error - please check your connection";
  }

  if (isTimeoutError(error)) {
    return "Request timed out - please try again";
  }

  return error?.response?.data?.message || error?.message || defaultMessage;
}

/**
 * Normalized error object for consistent handling
 */
export type { NormalizedApiError };

/**
 * Normalizes different error types into a consistent structure
 * @param error - The error to normalize
 * @returns Normalized error object
 */
export function normalizeError(error: any): NormalizedApiError {
  return {
    message: getErrorMessage(error),
    status: error?.response?.status,
    isCancelled: isRequestCancelled(error),
    isNetworkError: isNetworkError(error),
    isTimeout: isTimeoutError(error),
    originalError: error,
  };
}

/**
 * Logs API request details
 * @param operation - Name of the operation
 * @param method - HTTP method
 * @param url - Request URL
 */
export function logRequest(operation: string, method: string, url: string) {
  apiLogger.debug(`${operation}`, {
    method,
    url,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Logs API response details
 * @param operation - Name of the operation
 * @param status - HTTP status code
 * @param duration - Request duration in ms
 */
export function logResponse(
  operation: string,
  status: number,
  duration?: number,
) {
  apiLogger.log(`${operation} - Success (${status})`, {
    duration: duration ? `${duration}ms` : "unknown",
  });
}

/**
 * Logs API error details
 * @param operation - Name of the operation
 * @param error - The error
 */
export function logError(operation: string, error: any) {
  const normalized = normalizeError(error);

  if (normalized.isCancelled) {
    apiLogger.debug(`${operation} - Cancelled`);
    return;
  }

  apiLogger.error(`${operation} - Failed (${normalized.status || "unknown"})`, {
    message: normalized.message,
    isNetworkError: normalized.isNetworkError,
    isTimeout: normalized.isTimeout,
  });
}

/**
 * Safe wrapper for async API calls with proper error handling and cancellation support
 * @param operation - Name of the operation for logging
 * @param apiCall - The async function to execute
 * @param signal - Optional AbortSignal for cancellation
 * @returns Result with data or error
 */
export async function safeApiCall<T>(
  operation: string,
  apiCall: (signal?: AbortSignal) => Promise<T>,
  signal?: AbortSignal,
): Promise<{ data: T | null; error: NormalizedApiError | null }> {
  try {
    logRequest(operation, "API", operation);
    const startTime = Date.now();

    const data = await apiCall(signal);
    const duration = Date.now() - startTime;

    logResponse(operation, 200, duration);
    return { data, error: null };
  } catch (error) {
    logError(operation, error);
    return { data: null, error: normalizeError(error) };
  }
}
