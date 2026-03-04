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

export interface GetAllPlantsResponseDTO {
  message: string;
  plant: PlantDetails[];
}

export interface GetPlantInfoResponseDTO {
  message: string;
  plant: PlantDetails;
}

export interface GetPlantHistoryForRackResponseDTO {
  data: PlantHistoryItem[];
  meta: PlantHistoryMeta;
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
