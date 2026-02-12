import {
	DeleteRackResponseDTO,
	GetRackInfoResponseDTO,
	GetRackStatusResponseDTO,
	RegisterRackRequestDTO,
	RegisterRackResponseDTO,
	UpdateRackRequestDTO,
	UpdateRackResponseDTO,
	GetRackCurrentStateResponseDTO,
	GetAllRacksResponseDTO
} from "@/types/rack.dto";
import { handleRequest } from "@/utils/request";

export const rackService = {
	async registerRack(
		refetch: any,
		body: RegisterRackRequestDTO
	): Promise<RegisterRackResponseDTO> {
		return handleRequest<RegisterRackResponseDTO>(
			"Registering rack",
			() => refetch({ body })
		);
	},

	async getRackbyId(refetch: any): Promise<GetRackInfoResponseDTO> {
		return handleRequest<GetRackInfoResponseDTO>(
			"Fetching rack info by ID",
			() => refetch()
		);
	},

	async deleteRackbyId(refetch: any): Promise<DeleteRackResponseDTO> {
		return handleRequest<DeleteRackResponseDTO>(
			"Deleting rack by ID",
			() => refetch()
		);
	},

	async updateRackbyId(
		refetch: any,
		body: UpdateRackRequestDTO
	): Promise<UpdateRackResponseDTO> {
		return handleRequest<UpdateRackResponseDTO>(
			"Updating rack by ID",
			() => refetch({ body })
		);
	},

	async getRackStatusbyId(refetch: any): Promise<GetRackStatusResponseDTO> {
		return handleRequest<GetRackStatusResponseDTO>(
			"Fetching rack status by ID",
			() => refetch()
		);
	},

	async getCurrentRackStateById(
		refetch: any
	): Promise<GetRackCurrentStateResponseDTO> {
		return handleRequest<GetRackCurrentStateResponseDTO>(
			"Fetching current rack state by ID",
			() => refetch()
		);
	},

	async getAllUserRack(refetch: any): Promise<GetAllRacksResponseDTO> {
		return handleRequest<GetAllRacksResponseDTO>(
			"Fetching all racks for user",
			() => refetch()
		);
	},
};