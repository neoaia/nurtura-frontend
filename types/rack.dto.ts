export interface GetRackInfoDTO {
  id: string;
  name: string;
  plant: string;
  image?: string;
  seeds: number;
  water: number;
  humidity: number;
  temperature: number;
  hasAlert?: boolean;
  onPress?: () => void;
  onMorePress?: () => void;
}

export interface PlantStatusDTO {
  temperature: number;
  humidity: number;
  waterLevel: number;
}

export interface CareActivityDTO {
  id: string;
  type: "water" | "light";
  plantName: string;
  duration: string;
  time: string;
}

export interface HarvestHistoryDTO {
  id: string;
  plantName: string;
  time: string;
}

export interface TotalHarvestDTO {
  totalFrequency: number;
  sinceDate: string;
  image?: string;
}

//for services

//requests
export interface RackIDRequestDTO {
  id: string;
}

export interface RegisterRackRequestDTO {
  name: string;
  macAddress: string;
  mqttTopic?: string;
  description?: string;
}

export interface UpdateRackRequestDTO {
  name: string;
  mqttTopic: string;
  description: string;
}

//responses
export interface GetAllRacksResponseDTO {
  data: {
    id: string;
    name: string;
    macAddress: string;
    status: string;
    lastSeenAt: string;
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetRackInfoResponseDTO {
  message: string;
  rack: {
    id: string;
    name: string;
    macAddress: string;
    mqttTopic?: string;
    description?: string;
    status: string;
    isActive: boolean;
    lastSeenAt: string;
    createdAt: string;
  };
}

export interface RegisterRackResponseDTO {
  message: string;
  id: string;
}

export interface DeleteRackResponseDTO {
  message: string;
}

export interface UpdateRackResponseDTO {
  message: string;
}

export interface GetRackCurrentStateResponseDTO {
  message: string;
  rack: {
    id: string;
    name: string;
    status: string;
    lastSeenAt: string;
  };
  latestReading: {
    temperature: number;
    humidity: number;
    moisture: number;
    lightLevel: number;
    timestamp: string;
  };
}

export interface GetRackStatusResponseDTO {
  message: string;
  status: string;
  lastSeenAt: string;
}
