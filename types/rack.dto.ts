export interface GetRackInfoDTO {
  id: string;
  name: string;
  plant: string;
  image?: string;
  leaves: number;
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
  value: string;
  time: string;
}

export interface HarvestHistoryDTO {
  id: string;
  value: number;
  plantName: string;
  time: string;
}

export interface TotalHarvestDTO {
  totalGrams: number;
  sinceDate: string;
  image?: string;
}

export interface RacksPageResponseDTO {
  racks: GetRackInfoDTO[];
  totalHarvest: TotalHarvestDTO;
  careActivities: CareActivityDTO[];
  harvestHistory: HarvestHistoryDTO[];
}

export interface RackDetailResponseDTO {
  rack: GetRackInfoDTO;
  plantStatus: PlantStatusDTO;
  careActivities: CareActivityDTO[];
  harvestHistory: HarvestHistoryDTO[];
}

export interface CreateRackRequestDTO {
  name: string;
  plantType?: string;
  location?: string;
}

export interface CreateRackResponseDTO {
  success: boolean;
  rackId?: string;
  message?: string;
}

export interface UpdateRackRequestDTO {
  id: string;
  name?: string;
  plantType?: string;
  location?: string;
}
