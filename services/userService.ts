import { UserDetailsResponseDTO } from "@/types/user.dto";
import { handleRequest } from "@/utils/request";
import { createLogger } from "@/utils/logger";
import { UserDetails } from "@/types/interface";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const logger = createLogger("userService");

export const userService = {
  async updateUser(refetch: any, body: UserDetails): Promise<UserDetailsResponseDTO> {
    logger.log("Updating user details with body:", body);
    return handleRequest<UserDetailsResponseDTO>(
      "Updating user details",
      () => refetch({ body })
    );
  },

  async getUser(refetch: any): Promise<UserDetailsResponseDTO> {
    logger.log("Fetching user details");
    return handleRequest<UserDetailsResponseDTO>(
      "Fetching user details",
      () => refetch()
    );
  }
}