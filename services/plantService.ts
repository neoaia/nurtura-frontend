import { handleRequest } from "@/utils/request";
import {
  AssignPlantToRackResponseDTO,
  CreatePlantRequestDTO,
  CreatePlantResponseDTO,
  DeletePlantResponseDTO,
  GetAllPlantsResponseDTO,
  GetPlantCareActivitiesResponseDTO,
  GetPlantHarvestActivitiesResponseDTO,
  GetPlantHistoryForRackResponseDTO,
  GetPlantInfoResponseDTO,
  GetPlantingActivitiesResponseDTO,
  HarvestPlantFromRackResponseDTO,
  PlantActivitiesRequestDTO,
  RemovePlantWithdrawnFromRackResponseDTO,
  UpdatePlantRequestDTO,
  UpdatePlantResponseDTO,
} from "../types/plant.dto";

export const plantService = {
  async createPlant(
    refetch: any,
    body: CreatePlantRequestDTO,
  ): Promise<CreatePlantResponseDTO> {
    return handleRequest<CreatePlantResponseDTO>("Creating plant", () =>
      refetch({ body }),
    );
  },

  async updatePlant(
    refetch: any,
    body: UpdatePlantRequestDTO,
  ): Promise<UpdatePlantResponseDTO> {
    return handleRequest<UpdatePlantResponseDTO>("Updating plant", () =>
      refetch({ body }),
    );
  },

  async deletePlant(refetch: any): Promise<DeletePlantResponseDTO> {
    return handleRequest<DeletePlantResponseDTO>("Deleting plant", () =>
      refetch(),
    );
  },

  async getAllPlants(refetch: any): Promise<GetAllPlantsResponseDTO> {
    return handleRequest<GetAllPlantsResponseDTO>("Fetching all plants", () =>
      refetch(),
    );
  },

  async getPlantInfo(refetch: any): Promise<GetPlantInfoResponseDTO> {
    return handleRequest<GetPlantInfoResponseDTO>("Fetching plant info", () =>
      refetch(),
    );
  },

  async getPlantHistoryForRack(
    refetch: any,
  ): Promise<GetPlantHistoryForRackResponseDTO> {
    return handleRequest<GetPlantHistoryForRackResponseDTO>(
      "Fetching plant history for rack",
      () => refetch(),
    );
  },

  async assignPlantToRack(
    refetch: any,
    body: { rackId: string; quantity: number; plantedAt: string },
  ): Promise<AssignPlantToRackResponseDTO> {
    return handleRequest<AssignPlantToRackResponseDTO>(
      "Assigning plant to rack",
      () => refetch({ body }),
    );
  },

  async harvestPlantFromRack(
    refetch: any,
  ): Promise<HarvestPlantFromRackResponseDTO> {
    return handleRequest<HarvestPlantFromRackResponseDTO>(
      "Harvesting plant from rack",
      () => refetch(),
    );
  },

  async removePlantWithdrawnFromRack(
    refetch: any,
  ): Promise<RemovePlantWithdrawnFromRackResponseDTO> {
    return handleRequest<RemovePlantWithdrawnFromRackResponseDTO>(
      "Removing plant withdrawn from rack",
      () => refetch(),
    );
  },

  async getPlantCareActivities(
    refetch: any,
    params?: PlantActivitiesRequestDTO,
  ): Promise<GetPlantCareActivitiesResponseDTO> {
    return handleRequest<GetPlantCareActivitiesResponseDTO>(
      "Fetching plant care activities",
      () => refetch({ params }),
    );
  },

  async getPlantHarvestActivities(
    refetch: any,
    params?: PlantActivitiesRequestDTO,
  ): Promise<GetPlantHarvestActivitiesResponseDTO> {
    return handleRequest<GetPlantHarvestActivitiesResponseDTO>(
      "Fetching plant harvest activities",
      () => refetch({ params }),
    );
  },

  async getPlantingActivities(
    refetch: any,
    params?: PlantActivitiesRequestDTO,
  ): Promise<GetPlantingActivitiesResponseDTO> {
    return handleRequest<GetPlantingActivitiesResponseDTO>(
      "Fetching planting activities",
      () => refetch({ params }),
    );
  },
};
