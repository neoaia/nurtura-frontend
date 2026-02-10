import { logger } from "./logger";


export async function handleRequest<T>(
  operation: string,
  requestFn: () => Promise<any>
): Promise<T> {
  logger.log(operation);

  try {
    const response = await requestFn();
    logger.debug("Response received", response);

    if (response.error) {
      logger.warn(`Error response: ${response.error?.message}`);
      throw new Error(response.error?.message || "Server error occurred");
    }

    if (!response.data) {
      logger.warn("No data received");
      throw new Error("No data received");
    }

    logger.log(`${operation} - Success`);
    return response.data as T;
  } catch (error) {
    logger.error(`${operation} - Failed`, error);
    // ✅ Re-throw original error to preserve stack trace
    throw error instanceof Error ? error : new Error(String(error));
  }
}