import { handleRequest } from "@/utils/request";
import {
  CheckUnreadNotificationsResponseDTO,
  MarkReadAllNotificationsResponseDTO,
  MarkReadNotificationResponseDTO,
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

  async markReadNotification(
    refetch: any,
    notificationId: string,
  ): Promise<MarkReadNotificationResponseDTO> {
    return handleRequest<MarkReadNotificationResponseDTO>(
      "Marking notification as read",
      () => refetch({ url: `/notifications/${notificationId}/read` }),
    );
  },

  async checkForUnreadNotifications(
    refetch: any,
  ): Promise<CheckUnreadNotificationsResponseDTO> {
    return handleRequest<CheckUnreadNotificationsResponseDTO>(
      "Checking for unread notifications",
      () => refetch(),
    );
  },
};
