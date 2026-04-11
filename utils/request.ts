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

const serviceLogger = createLogger("Service");

/**
 * Enhanced error handling for API requests
 * Distinguishes between cancelled requests and real errors
 * @param operation - Name of the operation for logging
 * @param requestFn - The async function that makes the request
 * @returns The response data or throws an error
 */
export async function handleRequest<T>(
  operation: string,
  requestFn: () => Promise<{
    data: T | null;
    error: NormalizedApiError | null;
    status: number;
  }>,
): Promise<T> {
  serviceLogger.debug(operation);

  try {
    const response = await requestFn();

    // Handle cancellation silently - don't show errors
    if (response.error?.isCancelled) {
      serviceLogger.debug(`${operation} - Cancelled`);
      throw new Error("Request was cancelled");
    }

    // Handle errors from the response
    if (response.error) {
      serviceLogger.warn(`${operation} - Error: ${response.error.message}`);
      throw new Error(response.error.message || "Request failed");
    }

    if (!response.data) {
      serviceLogger.warn(`${operation} - No data received`);
      throw new Error("No data received from server");
    }

    serviceLogger.log(`${operation} - Success`);
    return response.data as T;
  } catch (error) {
    // Re-throw with proper error message
    if (error instanceof Error) {
      serviceLogger.error(`${operation} - Failed: ${error.message}`);
      throw error;
    }

    const errorMsg = String(error);
    serviceLogger.error(`${operation} - Failed: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}
