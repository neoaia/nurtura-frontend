import { handleRequest } from "@/utils/request";
import { NotificationsResponseDTO } from "../types/notification.dto";

export const notificationService = {
  async getAllNotifications(refetch: any): Promise<NotificationsResponseDTO> {
    return handleRequest<NotificationsResponseDTO>(
      "Fetching notifications",
      () => refetch(),
    );
  },
};
