import {
  CreatePlantRequestDTO,
  CreatePlantResponseDTO,
  UpdatePlantRequestDTO,
  UpdatePlantResponseDTO,
  DeletePlantResponseDTO,
  GetAllPlantsResponseDTO,
  GetPlantInfoResponseDTO,
  GetPlantHistoryForRackResponseDTO,
  AssignPlantToRackResponseDTO,
  HarvestPlantFromRackResponseDTO,
  RemovePlantWithdrawnFromRackResponseDTO
} from '../types/plant.dto';
import { handleRequest } from '@/utils/request';

export const plantService = {
  async createPlant(
    refetch: any,
    body: CreatePlantRequestDTO
  ): Promise<CreatePlantResponseDTO> {
    return handleRequest<CreatePlantResponseDTO>(
      'Creating plant',
      () => refetch({ body })
    );
  },

  async updatePlant(
    refetch: any,
    body: UpdatePlantRequestDTO
  ): Promise<UpdatePlantResponseDTO> {
    return handleRequest<UpdatePlantResponseDTO>(
      'Updating plant',
      () => refetch({ body })
    );
  },

  async deletePlant(refetch: any): Promise<DeletePlantResponseDTO> {
    return handleRequest<DeletePlantResponseDTO>(
      'Deleting plant',
      () => refetch()
    );
  },

  async getAllPlants(refetch: any): Promise<GetAllPlantsResponseDTO> {
    return handleRequest<GetAllPlantsResponseDTO>(
      'Fetching all plants',
      () => refetch()
    );
  },

  async getPlantInfo(refetch: any): Promise<GetPlantInfoResponseDTO> {
    return handleRequest<GetPlantInfoResponseDTO>(
      'Fetching plant info',
      () => refetch()
    );
  },

  async getPlantHistoryForRack(
    refetch: any
  ): Promise<GetPlantHistoryForRackResponseDTO> {
    return handleRequest<GetPlantHistoryForRackResponseDTO>(
      'Fetching plant history for rack',
      () => refetch()
    );
  },

  async assignPlantToRack(
    refetch: any
  ): Promise<AssignPlantToRackResponseDTO> {
    return handleRequest<AssignPlantToRackResponseDTO>(
      'Assigning plant to rack',
      () => refetch()
    );
  },

  async harvestPlantFromRack(
    refetch: any
  ): Promise<HarvestPlantFromRackResponseDTO> {
    return handleRequest<HarvestPlantFromRackResponseDTO>(
      'Harvesting plant from rack',
      () => refetch()
    );
  },

  async removePlantWithdrawnFromRack(
    refetch: any
  ): Promise<RemovePlantWithdrawnFromRackResponseDTO> {
    return handleRequest<RemovePlantWithdrawnFromRackResponseDTO>(
      'Removing plant withdrawn from rack',
      () => refetch()
    );
  }
}