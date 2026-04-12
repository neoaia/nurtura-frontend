export interface PlantDetails {
  id: string;
  name: string;
  type: string;
  recommendedSoil: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlantHistoryItem {
  id: string;
  rackId: string;
  plantId: string;
  quantity: number;
  plantedAt: string;
  harvestedAt: string | null;
  harvestCount: number;
  plant: {
    id: string;
    name: string;
    type: string;
    recommendedSoil: string;
  };
}

export interface PlantHistoryMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PlantActivitiesRequestDTO {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  rackId?: string;
}

export interface PlantActivitiesMetaDTO {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PlantActivityRackDTO {
  id: string;
  name: string;
  macAddress: string;
}

export interface PlantActivityPlantDTO {
  id: string;
  name: string;
  category: string;
}

export type ActivityEventType =
  | "RACK_ADDED"
  | "RACK_REMOVED"
  | "PLANT_ADDED"
  | "PLANT_REMOVED"
  | "PLANT_CHANGED"
  | "PLANT_HARVESTED"
  | "LIGHT_ON"
  | "LIGHT_OFF"
  | "WATERING_ON"
  | "WATERING_OFF"
  | "AUTOMATION_TRIGGERED"
  | "DEVICE_ONLINE"
  | "DEVICE_OFFLINE";

export type PlantCareEventType = Extract<
  ActivityEventType,
  "WATERING_ON" | "WATERING_OFF" | "LIGHT_ON" | "LIGHT_OFF"
>;

export interface PlantCareActivityItemDTO {
  id: string;
  rackId: string;
  eventType: PlantCareEventType;
  details: string;
  timestamp: string;
  rack: PlantActivityRackDTO;
  currentPlant: PlantActivityPlantDTO;
}

export interface GetPlantCareActivitiesResponseDTO {
  data: PlantCareActivityItemDTO[];
  meta: PlantActivitiesMetaDTO;
  amount: number;
}

export interface PlantHarvestActivityMetadataDTO {
  plantId: string;
  plantName: string;
  rackId: string;
  harvestCount: number;
  quantity: number;
}

export interface PlantHarvestActivityItemDTO {
  id: string;
  rackId: string;
  eventType: Extract<ActivityEventType, "PLANT_HARVESTED">;
  details: string;
  metadata: PlantHarvestActivityMetadataDTO;
  timestamp: string;
  rack: PlantActivityRackDTO;
  plant: PlantActivityPlantDTO;
}

export interface GetPlantHarvestActivitiesResponseDTO {
  data: PlantHarvestActivityItemDTO[];
  meta: PlantActivitiesMetaDTO;
  amount: number;
  totalHarvestCount: number;
}

export interface PlantingActivityItemDTO {
  id: string;
  rackId: string;
  plantId: string;
  quantity: number;
  plantedAt: string;
  harvestedAt: string | null;
  plant: PlantActivityPlantDTO;
  rack: PlantActivityRackDTO;
}

export interface GetPlantingActivitiesResponseDTO {
  data: PlantingActivityItemDTO[];
  meta: PlantActivitiesMetaDTO;
  amount: number;
}

export interface GetAllPlantsResponseDTO {
  message: string;
  plant: PlantDetails[];
}

export interface GetTotalPlantedQuantityResponseDTO {
  totalQuantity: number;
}

export interface GetRackCountResponseDTO {
  count: number;
}

export interface GetPlantInfoResponseDTO {
  message: string;
  plant: PlantDetails;
}

export interface GetPlantHistoryForRackResponseDTO {
  data: PlantHistoryItem[];
  meta: PlantHistoryMeta;
}

export interface AssignPlantToRackRequestDTO {
  plantId: string;
  rackId: string;
  quantity: number;
  plantedAt: string;
}
export interface AssignPlantToRackResponseDTO {
  message: string;
}

export interface HarvestPlantFromRackResponseDTO {
  message: string;
}

export interface RemovePlantWithdrawnFromRackResponseDTO {
  message: string;
}

//for admin incase

export interface CreatePlantRequestDTO {
  name: string;
  type: string;
  recommendedSoil: string;
  description: string;
}

export interface UpdatePlantRequestDTO {
  name: string;
  type: string;
  recommendedSoil: string;
  description: string;
  isActive: boolean;
}

export interface DeletePlantResponseDTO {
  message: string;
}

export interface CreatePlantResponseDTO {
  message: string;
  plant: PlantDetails;
}

export interface UpdatePlantResponseDTO {
  message: string;
  plant: PlantDetails;
}

export interface CheckPlantAssignmentConditionsRequestDTO {
  plantId: string;
  quantity: number;
  plantedAt: string;
}
export interface CheckPlantAssignmentConditionsResponseDTO {
  hasWarning: boolean;
  latestTemperatureReading: number;
  maxTemperatureThreshold: number;
}
