import { logger } from "./logger";

export async function handleRequest<T>(
  operation: string,
  requestFn: () => Promise<any>,
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

    const status = response.status;
    if (status < 200 || status >= 300) {
      logger.warn(`Unexpected status code: ${status}`);
      throw new Error(`Unexpected status code: ${status}`);
    }

    logger.log(`${operation} - Success`);
    return response.data as T;
  } catch (error) {
    logger.error(`${operation} - Failed`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}
