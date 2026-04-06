export interface NotificationItemDTO {
  id: string;
  userId: string;
  rackId: string;
  type: string;
  status: "UNREAD" | "READ";
  title: string;
  message: string;
  metadata: Record<string, any>;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMetaDTO {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsResponseDTO {
  data: NotificationItemDTO[];
  meta: PaginationMetaDTO;
  unreadCount: number;
}
