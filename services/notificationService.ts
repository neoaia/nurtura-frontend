import { handleRequest } from "@/utils/request";
import {
  MarkReadAllNotificationsResponseDTO,
  NotificationsResponseDTO,
} from "../types/notification.dto";

export const notificationService = {
  async getAllNotifications(refetch: any): Promise<NotificationsResponseDTO> {
    return handleRequest<NotificationsResponseDTO>(
      "Fetching notifications",
      () => refetch(),
    );
  },

  async markReadAllNotifications(
    refetch: any,
  ): Promise<MarkReadAllNotificationsResponseDTO> {
    return handleRequest<MarkReadAllNotificationsResponseDTO>(
      "Marking all notifications as read",
      () => refetch(),
    );
  },
};
