import { plantService } from "../../services/plantService";
import {
    CreatePlantRequestDTO,
    PlantActivitiesRequestDTO,
    UpdatePlantRequestDTO,
} from "../../types/plant.dto";

jest.mock("../../utils/logger", () => ({
  logger: {
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPlantDetails = {
  id: "clx1abc123",
  name: "Lettuce",
  type: "LEAFY_GREENS",
  recommendedSoil: "LOAMY",
  description: "A crispy leafy green perfect for salads.",
  isActive: true,
  createdAt: "2026-01-15T08:00:00.000Z",
  updatedAt: "2026-01-15T08:00:00.000Z",
};

const mockHistoryItem = {
  id: "clx9xyz789",
  rackId: "clx2def456",
  plantId: "clx1abc123",
  quantity: 10,
  plantedAt: "2026-01-01T08:00:00.000Z",
  harvestedAt: "2026-02-01T08:00:00.000Z",
  harvestCount: 1,
  plant: {
    id: "clx1abc123",
    name: "Lettuce",
    type: "LEAFY_GREENS",
    recommendedSoil: "LOAMY",
  },
};

const mockMeta = {
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 5,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const mockActivityParams: PlantActivitiesRequestDTO = {
  page: 1,
  limit: 10,
  startDate: "2026-02-01T00:00:00.000Z",
  endDate: "2026-02-28T23:59:59.999Z",
};

const mockCareActivityItem = {
  id: "clx7care001",
  rackId: "clx2def456",
  eventType: "WATERING_ON",
  details: "Watering started. Moisture below threshold",
  timestamp: "2026-02-11T14:30:00.000Z",
  rack: {
    id: "clx2def456",
    name: "Living Room Farm",
    macAddress: "A8:BC:CD:0E:EF:F9",
  },
  currentPlant: {
    id: "clx001plant123",
    name: "Lettuce",
    category: "LEAFY_GREENS",
  },
};

const mockHarvestActivityItem = {
  id: "clx7harv001",
  rackId: "clx2def456",
  eventType: "PLANT_HARVESTED",
  details: "Harvest 3 of 'Lettuce' from rack 'Living Room Farm'",
  metadata: {
    plantId: "clx001plant123",
    plantName: "Lettuce",
    rackId: "clx2def456",
    harvestCount: 3,
    quantity: 50,
  },
  timestamp: "2026-02-11T14:30:00.000Z",
  rack: {
    id: "clx2def456",
    name: "Living Room Farm",
    macAddress: "A8:BC:CD:0E:EF:F9",
  },
  plant: {
    id: "clx001plant123",
    name: "Lettuce",
    category: "LEAFY_GREENS",
  },
};

const mockPlantingActivityItem = {
  id: "clx9h9bi5t001",
  rackId: "clx2def456",
  plantId: "clx003plant123",
  quantity: 10,
  plantedAt: "2026-01-01T08:00:00.000Z",
  harvestedAt: "2026-02-01T08:00:00.000Z",
  plant: {
    id: "clx003plant123",
    name: "Lettuce",
    category: "LEAFY_GREENS",
  },
  rack: {
    id: "clx2def456",
    name: "Living Room Farm",
    macAddress: "A8:BC:CD:0E:EF:F9",
  },
};

describe("plantService", () => {
  let mockRefetch: jest.Mock;

  beforeEach(() => {
    mockRefetch = jest.fn();
    jest.clearAllMocks();
  });

  describe("createPlant", () => {
    const body: CreatePlantRequestDTO = {
      name: "Lettuce",
      type: "LEAFY_GREENS",
      recommendedSoil: "LOAMY",
      description: "A crispy leafy green perfect for salads.",
    };

    it("returns created plant on success", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          message: "Plant created successfully",
          plant: mockPlantDetails,
        },
        status: 200,
      });
      const result = await plantService.createPlant(mockRefetch, body);
      expect(result).toEqual({
        message: "Plant created successfully",
        plant: mockPlantDetails,
      });
      expect(mockRefetch).toHaveBeenCalledWith({ body });
    });

    it("passes the request body correctly", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          message: "Plant created successfully",
          plant: mockPlantDetails,
        },
        status: 200,
      });
      await plantService.createPlant(mockRefetch, body);
      expect(mockRefetch).toHaveBeenCalledWith({ body });
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({
        error: { message: "Validation failed" },
      });
      await expect(plantService.createPlant(mockRefetch, body)).rejects.toThrow(
        "Validation failed",
      );
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(plantService.createPlant(mockRefetch, body)).rejects.toThrow(
        "No data received",
      );
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Created", plant: mockPlantDetails },
        status: 201,
      });
      await expect(plantService.createPlant(mockRefetch, body)).rejects.toThrow(
        "Unexpected status code: 201",
      );
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));
      await expect(plantService.createPlant(mockRefetch, body)).rejects.toThrow(
        "Network error",
      );
    });

    it("throws when refetch rejects with a non-Error value", async () => {
      mockRefetch.mockRejectedValue("string error");
      await expect(plantService.createPlant(mockRefetch, body)).rejects.toThrow(
        "string error",
      );
    });
  });

  describe("updatePlant", () => {
    const body: UpdatePlantRequestDTO = {
      name: "Spinach",
      type: "LEAFY_GREENS",
      recommendedSoil: "SANDY",
      description: "Updated description.",
      isActive: false,
    };

    it("returns updated plant on success", async () => {
      const updated = { ...mockPlantDetails, name: "Spinach", isActive: false };
      mockRefetch.mockResolvedValue({
        data: { message: "Plant updated successfully", plant: updated },
        status: 200,
      });
      const result = await plantService.updatePlant(mockRefetch, body);
      expect(result.plant.name).toBe("Spinach");
      expect(mockRefetch).toHaveBeenCalledWith({ body });
    });

    it("passes the request body correctly", async () => {
      const updated = { ...mockPlantDetails, ...body };
      mockRefetch.mockResolvedValue({
        data: { message: "Plant updated successfully", plant: updated },
        status: 200,
      });
      await plantService.updatePlant(mockRefetch, body);
      expect(mockRefetch).toHaveBeenCalledWith({ body });
    });

    it("reflects isActive false in the response", async () => {
      const updated = { ...mockPlantDetails, isActive: false };
      mockRefetch.mockResolvedValue({
        data: { message: "Plant updated successfully", plant: updated },
        status: 200,
      });
      const result = await plantService.updatePlant(mockRefetch, body);
      expect(result.plant.isActive).toBe(false);
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Plant not found" } });
      await expect(plantService.updatePlant(mockRefetch, body)).rejects.toThrow(
        "Plant not found",
      );
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(plantService.updatePlant(mockRefetch, body)).rejects.toThrow(
        "No data received",
      );
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Updated", plant: mockPlantDetails },
        status: 204,
      });
      await expect(plantService.updatePlant(mockRefetch, body)).rejects.toThrow(
        "Unexpected status code: 204",
      );
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Connection timeout"));
      await expect(plantService.updatePlant(mockRefetch, body)).rejects.toThrow(
        "Connection timeout",
      );
    });
  });

  describe("deletePlant", () => {
    it("returns success message on delete", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant deleted successfully" },
        status: 200,
      });
      const result = await plantService.deletePlant(mockRefetch);
      expect(result).toEqual({ message: "Plant deleted successfully" });
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("calls refetch with no arguments", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant deleted successfully" },
        status: 200,
      });
      await plantService.deletePlant(mockRefetch);
      expect(mockRefetch).toHaveBeenCalledWith();
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Plant not found" } });
      await expect(plantService.deletePlant(mockRefetch)).rejects.toThrow(
        "Plant not found",
      );
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(plantService.deletePlant(mockRefetch)).rejects.toThrow(
        "No data received",
      );
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Deleted" },
        status: 404,
      });
      await expect(plantService.deletePlant(mockRefetch)).rejects.toThrow(
        "Unexpected status code: 404",
      );
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));
      await expect(plantService.deletePlant(mockRefetch)).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("getAllPlants", () => {
    it("returns list of plants on success", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          message: "Plants retrieved successfully",
          plant: [mockPlantDetails],
        },
        status: 200,
      });
      const result = await plantService.getAllPlants(mockRefetch);
      expect(result.plant).toHaveLength(1);
      expect(result.plant[0].name).toBe("Lettuce");
    });

    it("returns empty array when no plants exist", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plants retrieved successfully", plant: [] },
        status: 200,
      });
      const result = await plantService.getAllPlants(mockRefetch);
      expect(result.plant).toEqual([]);
    });

    it("returns multiple plants", async () => {
      const secondPlant = {
        ...mockPlantDetails,
        id: "clx2abc456",
        name: "Spinach",
      };
      mockRefetch.mockResolvedValue({
        data: {
          message: "Plants retrieved successfully",
          plant: [mockPlantDetails, secondPlant],
        },
        status: 200,
      });
      const result = await plantService.getAllPlants(mockRefetch);
      expect(result.plant).toHaveLength(2);
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Unauthorized" } });
      await expect(plantService.getAllPlants(mockRefetch)).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(plantService.getAllPlants(mockRefetch)).rejects.toThrow(
        "No data received",
      );
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "OK", plant: [] },
        status: 500,
      });
      await expect(plantService.getAllPlants(mockRefetch)).rejects.toThrow(
        "Unexpected status code: 500",
      );
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));
      await expect(plantService.getAllPlants(mockRefetch)).rejects.toThrow(
        "Network error",
      );
    });

    it("handles concurrent calls", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          message: "Plants retrieved successfully",
          plant: [mockPlantDetails],
        },
        status: 200,
      });
      const [r1, r2] = await Promise.all([
        plantService.getAllPlants(mockRefetch),
        plantService.getAllPlants(mockRefetch),
      ]);
      expect(r1.plant).toHaveLength(1);
      expect(r2.plant).toHaveLength(1);
    });
  });

  describe("getPlantInfo", () => {
    it("returns plant details on success", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          message: "Plant retrieved successfully",
          plant: mockPlantDetails,
        },
        status: 200,
      });
      const result = await plantService.getPlantInfo(mockRefetch);
      expect(result.plant).toEqual(mockPlantDetails);
    });

    it("returns all expected plant fields", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          message: "Plant retrieved successfully",
          plant: mockPlantDetails,
        },
        status: 200,
      });
      const result = await plantService.getPlantInfo(mockRefetch);
      expect(result.plant).toHaveProperty("id");
      expect(result.plant).toHaveProperty("name");
      expect(result.plant).toHaveProperty("type");
      expect(result.plant).toHaveProperty("recommendedSoil");
      expect(result.plant).toHaveProperty("description");
      expect(result.plant).toHaveProperty("isActive");
      expect(result.plant).toHaveProperty("createdAt");
      expect(result.plant).toHaveProperty("updatedAt");
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Plant not found" } });
      await expect(plantService.getPlantInfo(mockRefetch)).rejects.toThrow(
        "Plant not found",
      );
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(plantService.getPlantInfo(mockRefetch)).rejects.toThrow(
        "No data received",
      );
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));
      await expect(plantService.getPlantInfo(mockRefetch)).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("getPlantHistoryForRack", () => {
    it("returns paginated history on success", async () => {
      mockRefetch.mockResolvedValue({
        data: { data: [mockHistoryItem], meta: mockMeta },
        status: 200,
      });
      const result = await plantService.getPlantHistoryForRack(mockRefetch);
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(5);
    });

    it("returns correct pagination metadata", async () => {
      mockRefetch.mockResolvedValue({
        data: { data: [mockHistoryItem], meta: mockMeta },
        status: 200,
      });
      const result = await plantService.getPlantHistoryForRack(mockRefetch);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it("handles history item with null harvestedAt", async () => {
      const unharvestedItem = {
        ...mockHistoryItem,
        harvestedAt: null,
        harvestCount: 0,
      };
      mockRefetch.mockResolvedValue({
        data: { data: [unharvestedItem], meta: mockMeta },
        status: 200,
      });
      const result = await plantService.getPlantHistoryForRack(mockRefetch);
      expect(result.data[0].harvestedAt).toBeNull();
      expect(result.data[0].harvestCount).toBe(0);
    });

    it("returns empty data array when no history exists", async () => {
      const emptyMeta = { ...mockMeta, totalItems: 0 };
      mockRefetch.mockResolvedValue({
        data: { data: [], meta: emptyMeta },
        status: 200,
      });
      const result = await plantService.getPlantHistoryForRack(mockRefetch);
      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
    });

    it("handles multiple history items", async () => {
      const secondItem = {
        ...mockHistoryItem,
        id: "clx9xyz000",
        harvestCount: 3,
      };
      mockRefetch.mockResolvedValue({
        data: {
          data: [mockHistoryItem, secondItem],
          meta: { ...mockMeta, totalItems: 2 },
        },
        status: 200,
      });
      const result = await plantService.getPlantHistoryForRack(mockRefetch);
      expect(result.data).toHaveLength(2);
    });

    it("handles next page available", async () => {
      const nextPageMeta = {
        ...mockMeta,
        hasNextPage: true,
        totalItems: 20,
        totalPages: 2,
      };
      mockRefetch.mockResolvedValue({
        data: { data: [mockHistoryItem], meta: nextPageMeta },
        status: 200,
      });
      const result = await plantService.getPlantHistoryForRack(mockRefetch);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.totalPages).toBe(2);
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Rack not found" } });
      await expect(
        plantService.getPlantHistoryForRack(mockRefetch),
      ).rejects.toThrow("Rack not found");
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(
        plantService.getPlantHistoryForRack(mockRefetch),
      ).rejects.toThrow("No data received");
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { data: [], meta: mockMeta },
        status: 403,
      });
      await expect(
        plantService.getPlantHistoryForRack(mockRefetch),
      ).rejects.toThrow("Unexpected status code: 403");
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));
      await expect(
        plantService.getPlantHistoryForRack(mockRefetch),
      ).rejects.toThrow("Network error");
    });
  });

  describe("assignPlantToRack", () => {
    const assignBody = {
      plantId: "plant-123",
      rackId: "clx2def456",
      quantity: 10,
      plantedAt: "2026-02-01T08:00:00.000Z",
    };

    it("returns success message on assignment", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant assigned to rack successfully" },
        status: 200,
      });
      const result = await plantService.assignPlantToRack(
        mockRefetch,
        assignBody,
      );
      expect(result).toEqual({
        message: "Plant assigned to rack successfully",
      });
    });

    it("calls refetch once", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant assigned to rack successfully" },
        status: 200,
      });
      await plantService.assignPlantToRack(mockRefetch, assignBody);
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Rack is full" } });
      await expect(
        plantService.assignPlantToRack(mockRefetch, assignBody),
      ).rejects.toThrow("Rack is full");
    });

    it("throws when plant is already assigned", async () => {
      mockRefetch.mockResolvedValue({
        error: { message: "Plant already assigned to this rack" },
      });
      await expect(
        plantService.assignPlantToRack(mockRefetch, assignBody),
      ).rejects.toThrow("Plant already assigned to this rack");
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(
        plantService.assignPlantToRack(mockRefetch, assignBody),
      ).rejects.toThrow("No data received");
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Assigned" },
        status: 409,
      });
      await expect(
        plantService.assignPlantToRack(mockRefetch, assignBody),
      ).rejects.toThrow("Unexpected status code: 409");
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));
      await expect(
        plantService.assignPlantToRack(mockRefetch, assignBody),
      ).rejects.toThrow("Network error");
    });
  });

  describe("harvestPlantFromRack", () => {
    it("returns success message on harvest", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant harvested successfully" },
        status: 200,
      });
      const result = await plantService.harvestPlantFromRack(mockRefetch);
      expect(result).toEqual({ message: "Plant harvested successfully" });
    });

    it("calls refetch once", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant harvested successfully" },
        status: 200,
      });
      await plantService.harvestPlantFromRack(mockRefetch);
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("throws when plant has not been planted yet", async () => {
      mockRefetch.mockResolvedValue({
        error: { message: "No active plant to harvest" },
      });
      await expect(
        plantService.harvestPlantFromRack(mockRefetch),
      ).rejects.toThrow("No active plant to harvest");
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({
        error: { message: "Server error occurred" },
      });
      await expect(
        plantService.harvestPlantFromRack(mockRefetch),
      ).rejects.toThrow("Server error occurred");
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(
        plantService.harvestPlantFromRack(mockRefetch),
      ).rejects.toThrow("No data received");
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Harvested" },
        status: 400,
      });
      await expect(
        plantService.harvestPlantFromRack(mockRefetch),
      ).rejects.toThrow("Unexpected status code: 400");
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));
      await expect(
        plantService.harvestPlantFromRack(mockRefetch),
      ).rejects.toThrow("Network error");
    });
  });

  describe("removePlantWithdrawnFromRack", () => {
    it("returns success message on removal", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant removed from rack successfully" },
        status: 200,
      });
      const result =
        await plantService.removePlantWithdrawnFromRack(mockRefetch);
      expect(result).toEqual({
        message: "Plant removed from rack successfully",
      });
    });

    it("calls refetch once", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant removed from rack successfully" },
        status: 200,
      });
      await plantService.removePlantWithdrawnFromRack(mockRefetch);
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("throws when plant is not in the rack", async () => {
      mockRefetch.mockResolvedValue({
        error: { message: "Plant not found in rack" },
      });
      await expect(
        plantService.removePlantWithdrawnFromRack(mockRefetch),
      ).rejects.toThrow("Plant not found in rack");
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Forbidden" } });
      await expect(
        plantService.removePlantWithdrawnFromRack(mockRefetch),
      ).rejects.toThrow("Forbidden");
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });
      await expect(
        plantService.removePlantWithdrawnFromRack(mockRefetch),
      ).rejects.toThrow("No data received");
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Removed" },
        status: 404,
      });
      await expect(
        plantService.removePlantWithdrawnFromRack(mockRefetch),
      ).rejects.toThrow("Unexpected status code: 404");
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));
      await expect(
        plantService.removePlantWithdrawnFromRack(mockRefetch),
      ).rejects.toThrow("Network error");
    });

    it("handles concurrent remove calls", async () => {
      mockRefetch.mockResolvedValue({
        data: { message: "Plant removed from rack successfully" },
        status: 200,
      });
      const [r1, r2] = await Promise.all([
        plantService.removePlantWithdrawnFromRack(mockRefetch),
        plantService.removePlantWithdrawnFromRack(mockRefetch),
      ]);
      expect(r1.message).toBe("Plant removed from rack successfully");
      expect(r2.message).toBe("Plant removed from rack successfully");
    });
  });

  describe("getPlantCareActivities", () => {
    it("returns paginated care activities on success", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          data: [mockCareActivityItem],
          meta: mockMeta,
          amount: 1,
        },
        status: 200,
      });

      const result = await plantService.getPlantCareActivities(
        mockRefetch,
        mockActivityParams,
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].eventType).toBe("WATERING_ON");
      expect(result.amount).toBe(1);
      expect(mockRefetch).toHaveBeenCalledWith({ params: mockActivityParams });
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Unauthorized" } });

      await expect(
        plantService.getPlantCareActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Unauthorized");
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });

      await expect(
        plantService.getPlantCareActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("No data received");
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { data: [], meta: mockMeta, amount: 0 },
        status: 500,
      });

      await expect(
        plantService.getPlantCareActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Unexpected status code: 500");
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));

      await expect(
        plantService.getPlantCareActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Network error");
    });
  });

  describe("getPlantHarvestActivities", () => {
    it("returns harvest activities with totalHarvestCount", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          data: [mockHarvestActivityItem],
          meta: mockMeta,
          amount: 1,
          totalHarvestCount: 150,
        },
        status: 200,
      });

      const result = await plantService.getPlantHarvestActivities(
        mockRefetch,
        mockActivityParams,
      );

      expect(result.data[0].metadata.harvestCount).toBe(3);
      expect(result.totalHarvestCount).toBe(150);
      expect(mockRefetch).toHaveBeenCalledWith({ params: mockActivityParams });
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Forbidden" } });

      await expect(
        plantService.getPlantHarvestActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Forbidden");
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });

      await expect(
        plantService.getPlantHarvestActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("No data received");
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { data: [], meta: mockMeta, amount: 0, totalHarvestCount: 0 },
        status: 401,
      });

      await expect(
        plantService.getPlantHarvestActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Unexpected status code: 401");
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));

      await expect(
        plantService.getPlantHarvestActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Network error");
    });
  });

  describe("getPlantingActivities", () => {
    it("returns planting activities on success", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          data: [mockPlantingActivityItem],
          meta: mockMeta,
          amount: 1,
        },
        status: 200,
      });

      const result = await plantService.getPlantingActivities(
        mockRefetch,
        mockActivityParams,
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].plant.name).toBe("Lettuce");
      expect(mockRefetch).toHaveBeenCalledWith({ params: mockActivityParams });
    });

    it("supports null harvestedAt values", async () => {
      mockRefetch.mockResolvedValue({
        data: {
          data: [{ ...mockPlantingActivityItem, harvestedAt: null }],
          meta: mockMeta,
          amount: 1,
        },
        status: 200,
      });

      const result = await plantService.getPlantingActivities(
        mockRefetch,
        mockActivityParams,
      );

      expect(result.data[0].harvestedAt).toBeNull();
    });

    it("throws when server returns an error", async () => {
      mockRefetch.mockResolvedValue({ error: { message: "Unauthorized" } });

      await expect(
        plantService.getPlantingActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Unauthorized");
    });

    it("throws when response has no data", async () => {
      mockRefetch.mockResolvedValue({ status: 200 });

      await expect(
        plantService.getPlantingActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("No data received");
    });

    it("throws when status is not 200", async () => {
      mockRefetch.mockResolvedValue({
        data: { data: [], meta: mockMeta, amount: 0 },
        status: 409,
      });

      await expect(
        plantService.getPlantingActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Unexpected status code: 409");
    });

    it("throws on network error", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));

      await expect(
        plantService.getPlantingActivities(mockRefetch, mockActivityParams),
      ).rejects.toThrow("Network error");
    });
  });
});
