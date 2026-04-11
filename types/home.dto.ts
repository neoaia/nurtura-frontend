export interface UserDTO {
  name: string;
  email?: string;
  hasNotifications: boolean;
}

export interface SummaryCardDTO {
  id: string;
  type: "racks" | "plants";
  value: number | null;
  isActive?: boolean;
}

export interface HighlightDTO {
  title: string;
  description: string;
  buttonText: string;
}

export interface DashboardActivityDTO {
  id: string;
  type: "water" | "light";
  action: string;
  plant: string;
  timestamp: string;
  duration?: string;
}

export interface DashboardResponseDTO {
  user: UserDTO;
  summary: SummaryCardDTO[];
  highlight: HighlightDTO;
  recentActivity: DashboardActivityDTO[];
}

export interface BackendNotificationDTO {
  id: string;
  userId: string;
  rackId: string | null;
  type: string;
  status: "UNREAD" | "READ";
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendNotificationsMetaDTO {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BackendNotificationsResponseDTO {
  data: BackendNotificationDTO[];
  meta: BackendNotificationsMetaDTO;
  unreadCount: number;
}

export interface AddRackRequestDTO {
  name: string;
  location?: string;
  capacity?: number;
}

export interface AddRackResponseDTO {
  success: boolean;
  rackId?: string;
  message?: string;
}
