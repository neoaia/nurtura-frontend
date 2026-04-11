import { UserDetails } from "@/types/interface";
import { UserDetailsResponseDTO } from "@/types/user.dto";
import { createLogger } from "@/utils/logger";
import { handleRequest } from "@/utils/request";

const logger = createLogger("userService");

export const userService = {
  async updateUser(
    refetch: any,
    body: UserDetails,
  ): Promise<UserDetailsResponseDTO> {
    logger.log("Updating user details with body:", body);
    return handleRequest<UserDetailsResponseDTO>("Updating user details", () =>
      refetch({ body }),
    );
  },

  async getUser(refetch: any): Promise<UserDetailsResponseDTO> {
    logger.log("Fetching user details");

    try {
      const response = await refetch();

      if (response.error) {
        const message = response.error.message ?? "Request failed";
        const isUserNotFound =
          message.toLowerCase().includes("user not found") ||
          response.status === 404;

        if (isUserNotFound) {
          logger.warn(
            "Fetching user details - User not found, returning empty userInfo",
          );
          return {
            message: "User not found",
            userInfo: {},
          } as UserDetailsResponseDTO;
        }

        logger.error("Fetching user details - Failed:", message);
        throw new Error(message);
      }

      if (!response.data) {
        logger.error("Fetching user details - No data received");
        throw new Error("No data received from server");
      }

      logger.log("Fetching user details - Success");
      return response.data as UserDetailsResponseDTO;
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Fetching user details - Exception:", error.message);
        throw error;
      }

      const errorMessage = String(error);
      logger.error("Fetching user details - Exception:", errorMessage);
      throw new Error(errorMessage);
    }
  },
};
