/**
 * Error Display Utility
 * Provides helpers for displaying errors in UI while filtering out cancelled requests
 */

import { NormalizedApiError } from "@/types/interface";

/**
 * Determines if an error should be shown to the user
 * Cancelled requests should NOT be shown
 * @param error - The error object
 * @returns true if error should be displayed to user
 */
export function shouldShowError(
  error: NormalizedApiError | null | undefined,
): boolean {
  if (!error) return false;
  // Don't show errors for cancelled requests
  if (error.isCancelled) return false;
  return true;
}

/**
 * Get user-friendly error message for display
 * @param error - The error object
 * @returns User-friendly error message
 */
export function getDisplayErrorMessage(
  error: NormalizedApiError | null | undefined,
): string {
  if (!error) return "";

  if (error.isNetworkError) {
    return "Connection error. Please check your internet and try again.";
  }

  if (error.isTimeout) {
    return "Request timed out. Please try again.";
  }

  if (error.isCancelled) {
    return ""; // Don't show cancelled messages
  }

  return error.message || "Something went wrong. Please try again.";
}

/**
 * Get error type for custom handling
 * @param error - The error object
 * @returns Error type string
 */
export function getErrorType(
  error: NormalizedApiError | null | undefined,
): "network" | "timeout" | "cancelled" | "server" | "unknown" {
  if (!error) return "unknown";

  if (error.isCancelled) return "cancelled";
  if (error.isNetworkError) return "network";
  if (error.isTimeout) return "timeout";
  if (error.status && error.status >= 500) return "server";

  return "unknown";
}

/**
 * Format error for logging/debugging
 * @param error - The error object
 * @returns Formatted error string
 */
export function formatErrorForLogging(
  error: NormalizedApiError | null | undefined,
): string {
  if (!error) return "No error";

  const type = getErrorType(error);
  const message = error.message || "Unknown error";
  const status = error.status ? ` [${error.status}]` : "";

  return `${type}${status}: ${message}`;
}

/**
 * Hook-friendly error state management
 * Returns whether error should be displayed and the message
 */
export interface ErrorDisplayState {
  isError: boolean;
  message: string;
  type: "network" | "timeout" | "cancelled" | "server" | "unknown";
}

/**
 * Convert API error to display state
 * @param error - The API error
 * @returns Error display state
 */
export function toErrorDisplayState(
  error: NormalizedApiError | null | undefined,
): ErrorDisplayState {
  return {
    isError: shouldShowError(error),
    message: getDisplayErrorMessage(error),
    type: getErrorType(error),
  };
}
