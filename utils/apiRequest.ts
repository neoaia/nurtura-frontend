/**
 * API Request Utility Module
 * Provides utilities for making safe API requests with proper cancellation and error handling
 */

import { getFirebaseIdToken } from "@/lib/firebaseAuth";
import { NormalizedApiError } from "@/types/interface";
import axios, { AxiosRequestConfig } from "axios";
import {
    isRequestCancelled,
    logError,
    logRequest,
    logResponse,
    normalizeError,
} from "./apiError";
import { API_TIMEOUT_MS } from "./constants";

interface RequestConfig extends AxiosRequestConfig {
  withAuth?: boolean;
}

/**
 * Create a request configuration with auth token and timeout if needed
 */
async function createRequestConfig(
  config: RequestConfig,
): Promise<RequestConfig> {
  const finalConfig = { ...config };

  // Set timeout if not already set
  if (!finalConfig.timeout) {
    finalConfig.timeout = API_TIMEOUT_MS; // 15 second timeout
  }

  if (config.withAuth) {
    const token = await getFirebaseIdToken();
    if (token) {
      finalConfig.headers = {
        ...finalConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  if (!finalConfig.headers?.["Content-Type"]) {
    finalConfig.headers = {
      ...finalConfig.headers,
      "Content-Type": "application/json",
    };
  }

  return finalConfig;
}

/**
 * Make an API request with proper error handling and cancellation support
 * @param config - Axios request configuration
 * @returns Promise with response data or error
 */
export async function apiRequest<T = any>(
  config: RequestConfig,
): Promise<{ data: T | null; error: NormalizedApiError | null }> {
  const controller = new AbortController();

  try {
    const finalConfig = await createRequestConfig({
      ...config,
      signal: controller.signal,
    });

    logRequest(
      `${finalConfig.method} ${finalConfig.url}`,
      finalConfig.method || "GET",
      finalConfig.url || "",
    );

    const response = await axios(finalConfig);

    logResponse(`${finalConfig.method} ${finalConfig.url}`, response.status);

    return { data: response.data as T, error: null };
  } catch (error) {
    if (isRequestCancelled(error)) {
      // Don't treat cancellation as an error
      return { data: null, error: null };
    }

    logError(`${config.method} ${config.url}`, error);
    return { data: null, error: normalizeError(error) };
  }
}

/**
 * Make a GET request
 */
export async function apiGet<T = any>(
  url: string,
  withAuth: boolean = false,
): Promise<{ data: T | null; error: NormalizedApiError | null }> {
  return apiRequest<T>({
    url,
    method: "GET",
    withAuth,
  });
}

/**
 * Make a POST request
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  withAuth: boolean = false,
): Promise<{ data: T | null; error: NormalizedApiError | null }> {
  return apiRequest<T>({
    url,
    method: "POST",
    data,
    withAuth,
  });
}

/**
 * Make a PUT request
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  withAuth: boolean = false,
): Promise<{ data: T | null; error: NormalizedApiError | null }> {
  return apiRequest<T>({
    url,
    method: "PUT",
    data,
    withAuth,
  });
}

/**
 * Make a PATCH request
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  withAuth: boolean = false,
): Promise<{ data: T | null; error: NormalizedApiError | null }> {
  return apiRequest<T>({
    url,
    method: "PATCH",
    data,
    withAuth,
  });
}

/**
 * Make a DELETE request
 */
export async function apiDelete<T = any>(
  url: string,
  withAuth: boolean = false,
): Promise<{ data: T | null; error: NormalizedApiError | null }> {
  return apiRequest<T>({
    url,
    method: "DELETE",
    withAuth,
  });
}
