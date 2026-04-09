import {
  GetRackCountResponseDTO,
  GetTotalPlantedQuantityResponseDTO,
} from "@/types/plant.dto";
import {
  CheckIfRackExistsRequestDTO,
  CheckIfRackExistsResponseDTO,
  DeleteRackResponseDTO,
  GetAllRacksResponseDTO,
  GetRackCurrentStateResponseDTO,
  GetRackInfoResponseDTO,
  GetRackStatusResponseDTO,
  HarvestLeavesRequestDTO,
  HarvestLeavesResponseDTO,
  HarvestPlantRequestDTO,
  HarvestPlantResponseDTO,
  HarvestSeedsRequestDTO,
  HarvestSeedsResponseDTO,
  RegisterRackRequestDTO,
  RegisterRackResponseDTO,
  RemovePlantRequestDTO,
  RemovePlantResponseDTO,
  UpdateRackRequestDTO,
  UpdateRackResponseDTO,
} from "@/types/rack.dto";
import { handleRequest } from "@/utils/request";

export const rackService = {
  async registerRack(
    refetch: any,
    body: RegisterRackRequestDTO,
  ): Promise<RegisterRackResponseDTO> {
    return handleRequest<RegisterRackResponseDTO>("Registering rack", () =>
      refetch({ body }),
    );
  },

  async getRackbyId(refetch: any): Promise<GetRackInfoResponseDTO> {
    return handleRequest<GetRackInfoResponseDTO>(
      "Fetching rack info by ID",
      () => refetch(),
    );
  },

  async deleteRackbyId(refetch: any): Promise<DeleteRackResponseDTO> {
    return handleRequest<DeleteRackResponseDTO>("Deleting rack by ID", () =>
      refetch(),
    );
  },

  async updateRackbyId(
    refetch: any,
    body: UpdateRackRequestDTO,
  ): Promise<UpdateRackResponseDTO> {
    return handleRequest<UpdateRackResponseDTO>("Updating rack by ID", () =>
      refetch({ body }),
    );
  },

  async getRackStatusbyId(refetch: any): Promise<GetRackStatusResponseDTO> {
    return handleRequest<GetRackStatusResponseDTO>(
      "Fetching rack status by ID",
      () => refetch(),
    );
  },

  async getCurrentRackStateById(
    refetch: any,
  ): Promise<GetRackCurrentStateResponseDTO> {
    return handleRequest<GetRackCurrentStateResponseDTO>(
      "Fetching current rack state by ID",
      () => refetch(),
    );
  },

  async getAllUserRack(refetch: any): Promise<GetAllRacksResponseDTO> {
    return handleRequest<GetAllRacksResponseDTO>(
      "Fetching all racks for user",
      () => refetch(),
    );
  },

  async harvestLeaves(
    refetch: any,
    body: HarvestLeavesRequestDTO,
  ): Promise<HarvestLeavesResponseDTO> {
    return handleRequest<HarvestLeavesResponseDTO>(
      "Harvesting leaves from rack",
      () => refetch({ body }),
    );
  },

  async harvestSeeds(
    refetch: any,
    body: HarvestSeedsRequestDTO,
  ): Promise<HarvestSeedsResponseDTO> {
    return handleRequest<HarvestSeedsResponseDTO>(
      "Harvesting seeds from rack",
      () => refetch({ body }),
    );
  },

  async harvestPlant(
    refetch: any,
    body: HarvestPlantRequestDTO,
  ): Promise<HarvestPlantResponseDTO> {
    return handleRequest<HarvestPlantResponseDTO>(
      "Harvesting plant from rack",
      () => refetch({ body }),
    );
  },

  async removePlant(
    refetch: any,
    body: RemovePlantRequestDTO,
  ): Promise<RemovePlantResponseDTO> {
    return handleRequest<RemovePlantResponseDTO>(
      "Removing plant from rack",
      () => refetch({ body }),
    );
  },

  async getTotalPlantedQuantity(
    refetch: any,
  ): Promise<GetTotalPlantedQuantityResponseDTO> {
    return handleRequest<GetTotalPlantedQuantityResponseDTO>(
      "Fetching total planted quantity",
      () => refetch(),
    );
  },

  async getRackQuantity(refetch: any): Promise<GetRackCountResponseDTO> {
    return handleRequest<GetRackCountResponseDTO>("Fetching rack count", () =>
      refetch(),
    );
  },

  async checkIfRackExists(
    refetch: any,
    body: CheckIfRackExistsRequestDTO,
  ): Promise<CheckIfRackExistsResponseDTO> {
    return handleRequest<CheckIfRackExistsResponseDTO>(
      "Checking if rack exists",
      () => refetch({ params: { macAddress: body.macAddress } }),
    );
  },
};
