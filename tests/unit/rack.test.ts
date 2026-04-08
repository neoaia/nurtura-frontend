import { rackService } from "@/services/rackService";
import {
    DeleteRackResponseDTO,
    GetAllRacksResponseDTO,
    GetRackCurrentStateResponseDTO,
    GetRackInfoResponseDTO,
    GetRackStatusResponseDTO,
    RegisterRackRequestDTO,
    RegisterRackResponseDTO,
    UpdateRackRequestDTO,
    UpdateRackResponseDTO,
} from "@/types/rack.dto";

describe("rackService", () => {
  let mockRefetch: jest.Mock;

  beforeEach(() => {
    mockRefetch = jest.fn();
  });

  describe("registerRack", () => {
    const mockRackBody: RegisterRackRequestDTO = {
      name: "Living Room Farm",
      macAddress: "00:1A:2B:3C:4D:5E",
      mqttTopic: "nurtura/rack/living-room",
      description: "Vertical farm for herbs",
    };

    it("should successfully register a rack", async () => {
      const mockResponse: RegisterRackResponseDTO = {
        message: "Rack registered successfully",
        id: "clx123abc456",
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.registerRack(mockRefetch, mockRackBody);

      expect(result).toEqual(mockResponse);
      expect(mockRefetch).toHaveBeenCalledWith({ body: mockRackBody });
      expect(result.id).toBe("clx123abc456");
    });

    it("should throw error when server returns error response", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "MAC address already registered" },
        status: 400,
      });

      await expect(
        rackService.registerRack(mockRefetch, mockRackBody),
      ).rejects.toThrow("MAC address already registered");
    });

    it("should throw error when no data is received", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: null,
        status: 200,
      });

      await expect(
        rackService.registerRack(mockRefetch, mockRackBody),
      ).rejects.toThrow("No data received");
    });

    it("should throw error on network failure", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));

      await expect(
        rackService.registerRack(mockRefetch, mockRackBody),
      ).rejects.toThrow();
    });

    it("should handle invalid MAC address format", async () => {
      const invalidBody: RegisterRackRequestDTO = {
        ...mockRackBody,
        macAddress: "invalid-mac",
      };

      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Invalid MAC address format" },
        status: 400,
      });

      await expect(
        rackService.registerRack(mockRefetch, invalidBody),
      ).rejects.toThrow("Invalid MAC address format");
    });

    it("should accept optional mqttTopic and description", async () => {
      const minimalBody: RegisterRackRequestDTO = {
        name: "Kitchen Farm",
        macAddress: "00:1A:2B:3C:4D:5E",
      };

      const mockResponse: RegisterRackResponseDTO = {
        message: "Rack registered successfully",
        id: "clx123xyz789",
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.registerRack(mockRefetch, minimalBody);

      expect(result.id).toBe("clx123xyz789");
    });
  });

  describe("getRackbyId", () => {
    it("should successfully fetch rack info by ID", async () => {
      const mockResponse: GetRackInfoResponseDTO = {
        message: "Rack info retrieved successfully",
        rack: {
          id: "clx123abc456",
          userId: "user-123",
          name: "Living Room Farm",
          macAddress: "00:1A:2B:3C:4D:5E",
          mqttTopic: "nurtura/rack/living-room",
          description: "Vertical farm for herbs",
          currentPlantId: null,
          quantity: 0,
          plantedAt: null,
          lastHarvestAt: null,
          harvestCount: 0,
          isActive: true,
          status: "ONLINE",
          lastActivityAt: "2025-02-01T10:30:00.000Z",
          lastSeenAt: "2025-02-01T10:30:00.000Z",
          lastWateredAt: "2025-02-01T10:30:00.000Z",
          lastLightOnAt: "2025-02-01T10:30:00.000Z",
          createdAt: "2025-01-15T08:00:00.000Z",
          updatedAt: "2025-02-01T10:30:00.000Z",
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getRackbyId(mockRefetch);

      expect(result).toEqual(mockResponse);
      expect(result.rack.status).toBe("ONLINE");
      expect(result.rack.isActive).toBe(true);
    });

    it("should throw error when rack not found", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Rack not found" },
        status: 404,
      });

      await expect(rackService.getRackbyId(mockRefetch)).rejects.toThrow(
        "Rack not found",
      );
    });

    it("should throw error on server error", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Internal server error" },
        status: 500,
      });

      await expect(rackService.getRackbyId(mockRefetch)).rejects.toThrow(
        "Internal server error",
      );
    });

    it("should throw error when no data received", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: null,
        status: 200,
      });

      await expect(rackService.getRackbyId(mockRefetch)).rejects.toThrow(
        "No data received",
      );
    });

    it("should handle offline rack status", async () => {
      const mockResponse: GetRackInfoResponseDTO = {
        message: "Rack info retrieved successfully",
        rack: {
          id: "clx123abc456",
          userId: "user-123",
          name: "Living Room Farm",
          macAddress: "00:1A:2B:3C:4D:5E",
          mqttTopic: "nurtura/rack/living-room",
          description: "Vertical farm for herbs",
          currentPlantId: null,
          quantity: 0,
          plantedAt: null,
          lastHarvestAt: null,
          harvestCount: 0,
          isActive: false,
          status: "OFFLINE",
          lastActivityAt: "2025-02-01T08:00:00.000Z",
          lastSeenAt: "2025-02-01T08:00:00.000Z",
          lastWateredAt: "2025-02-01T08:00:00.000Z",
          lastLightOnAt: "2025-02-01T08:00:00.000Z",
          createdAt: "2025-01-15T08:00:00.000Z",
          updatedAt: "2025-02-01T08:00:00.000Z",
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getRackbyId(mockRefetch);

      expect(result.rack.status).toBe("OFFLINE");
      expect(result.rack.isActive).toBe(false);
    });
  });

  describe("deleteRackbyId", () => {
    it("should successfully delete rack", async () => {
      const mockResponse: DeleteRackResponseDTO = {
        message: "Rack deleted successfully",
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.deleteRackbyId(mockRefetch);

      expect(result.message).toBe("Rack deleted successfully");
    });

    it("should throw error when rack not found", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Rack not found" },
        status: 404,
      });

      await expect(rackService.deleteRackbyId(mockRefetch)).rejects.toThrow(
        "Rack not found",
      );
    });

    it("should throw error on unauthorized delete attempt", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Unauthorized: Cannot delete another users rack" },
        status: 403,
      });

      await expect(rackService.deleteRackbyId(mockRefetch)).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("should throw error when no data received", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: null,
        status: 200,
      });

      await expect(rackService.deleteRackbyId(mockRefetch)).rejects.toThrow(
        "No data received",
      );
    });
  });

  describe("updateRackbyId", () => {
    const mockUpdateBody: UpdateRackRequestDTO = {
      name: "Updated Kitchen Farm",
      mqttTopic: "nurtura/rack/kitchen-updated",
      description: "Updated description",
    };

    it("should successfully update rack information", async () => {
      const mockResponse: UpdateRackResponseDTO = {
        message: "Rack updated successfully",
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.updateRackbyId(
        mockRefetch,
        mockUpdateBody,
      );

      expect(result.message).toBe("Rack updated successfully");
      expect(mockRefetch).toHaveBeenCalledWith({ body: mockUpdateBody });
    });

    it("should throw error when updating non-existent rack", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Rack not found" },
        status: 404,
      });

      await expect(
        rackService.updateRackbyId(mockRefetch, mockUpdateBody),
      ).rejects.toThrow("Rack not found");
    });

    it("should throw error with invalid MQTT topic format", async () => {
      const invalidBody: UpdateRackRequestDTO = {
        name: "Kitchen Farm",
        mqttTopic: "invalid topic with spaces",
        description: "Test",
      };

      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Invalid MQTT topic format" },
        status: 400,
      });

      await expect(
        rackService.updateRackbyId(mockRefetch, invalidBody),
      ).rejects.toThrow("Invalid MQTT topic format");
    });

    it("should throw error when name is empty", async () => {
      const invalidBody: UpdateRackRequestDTO = {
        name: "",
        mqttTopic: "nurtura/rack/kitchen",
        description: "Test",
      };

      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Rack name cannot be empty" },
        status: 400,
      });

      await expect(
        rackService.updateRackbyId(mockRefetch, invalidBody),
      ).rejects.toThrow("Rack name cannot be empty");
    });
  });

  describe("getRackStatusbyId", () => {
    it("should successfully fetch rack status", async () => {
      const mockResponse: GetRackStatusResponseDTO = {
        message: "Device status retrieved successfully",
        status: "ONLINE",
        lastSeenAt: "2025-02-01T10:30:00.000Z",
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getRackStatusbyId(mockRefetch);

      expect(result.status).toBe("ONLINE");
      expect(result.message).toBe("Device status retrieved successfully");
      expect(result.lastSeenAt).toBe("2025-02-01T10:30:00.000Z");
    });

    it("should throw error when rack not found for status", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Rack not found or access denied" },
        status: 404,
      });

      await expect(rackService.getRackStatusbyId(mockRefetch)).rejects.toThrow(
        "Rack not found or access denied",
      );
    });

    it("should handle offline status", async () => {
      const mockResponse: GetRackStatusResponseDTO = {
        message: "Device status retrieved successfully",
        status: "OFFLINE",
        lastSeenAt: "2025-01-29T08:00:00.000Z",
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getRackStatusbyId(mockRefetch);

      expect(result.status).toBe("OFFLINE");
    });

    it("should handle error status", async () => {
      const mockResponse: GetRackStatusResponseDTO = {
        message: "Device status retrieved successfully",
        status: "ERROR",
        lastSeenAt: "2025-02-01T08:00:00.000Z",
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getRackStatusbyId(mockRefetch);

      expect(result.status).toBe("ERROR");
    });

    it("should handle maintenance status", async () => {
      const mockResponse: GetRackStatusResponseDTO = {
        message: "Device status retrieved successfully",
        status: "MAINTENANCE",
        lastSeenAt: "2025-02-01T10:00:00.000Z",
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getRackStatusbyId(mockRefetch);

      expect(result.status).toBe("MAINTENANCE");
    });
  });

  describe("getCurrentRackStateById", () => {
    it("should successfully fetch current rack state with sensor data", async () => {
      const mockResponse: GetRackCurrentStateResponseDTO = {
        message: "Current rack state retrieved successfully",
        rack: {
          id: "clx123abc456",
          name: "Living Room Farm",
          status: "ONLINE",
          lastSeenAt: "2025-02-01T10:30:00.000Z",
        },
        latestReading: {
          temperature: 25.5,
          humidity: 65.2,
          moisture: 45.8,
          lightLevel: 850,
          timestamp: "2025-02-01T10:25:00.000Z",
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getCurrentRackStateById(mockRefetch);

      expect(result.rack.id).toBe("clx123abc456");
      expect(result.latestReading.temperature).toBe(25.5);
      expect(result.latestReading.humidity).toBe(65.2);
      expect(result.latestReading.moisture).toBe(45.8);
      expect(result.latestReading.lightLevel).toBe(850);
    });

    it("should throw error when unable to fetch current state", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Failed to fetch sensor data" },
        status: 500,
      });

      await expect(
        rackService.getCurrentRackStateById(mockRefetch),
      ).rejects.toThrow("Failed to fetch sensor data");
    });

    it("should handle zero sensor readings", async () => {
      const mockResponse: GetRackCurrentStateResponseDTO = {
        message: "Current rack state retrieved successfully",
        rack: {
          id: "clx123abc456",
          name: "Living Room Farm",
          status: "OFFLINE",
          lastSeenAt: "2025-02-01T08:00:00.000Z",
        },
        latestReading: {
          temperature: 0,
          humidity: 0,
          moisture: 0,
          lightLevel: 0,
          timestamp: "2025-02-01T08:00:00.000Z",
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getCurrentRackStateById(mockRefetch);

      expect(result.latestReading.temperature).toBe(0);
      expect(result.latestReading.lightLevel).toBe(0);
    });

    it("should handle stale sensor data gracefully", async () => {
      const mockResponse: GetRackCurrentStateResponseDTO = {
        message: "Current rack state retrieved successfully",
        rack: {
          id: "clx123abc456",
          name: "Living Room Farm",
          status: "ONLINE",
          lastSeenAt: "2025-02-01T10:30:00.000Z",
        },
        latestReading: {
          temperature: 24.0,
          humidity: 60.0,
          moisture: 40.0,
          lightLevel: 800,
          timestamp: "2025-01-31T08:00:00.000Z",
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getCurrentRackStateById(mockRefetch);

      expect(result.latestReading).toBeDefined();
    });
  });

  describe("getAllUserRack", () => {
    it("should successfully fetch all racks for user with pagination", async () => {
      const mockResponse: GetAllRacksResponseDTO = {
        data: [
          {
            id: "clx123abc456",
            name: "Living Room Farm",
            macAddress: "00:1A:2B:3C:4D:5E",
            status: "ONLINE",
            lastSeenAt: "2025-02-01T10:30:00.000Z",
          },
          {
            id: "clx456def789",
            name: "Kitchen Farm",
            macAddress: "00:1A:2B:3C:4D:5F",
            status: "OFFLINE",
            lastSeenAt: "2025-01-31T08:00:00.000Z",
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getAllUserRack(mockRefetch);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe("Living Room Farm");
      expect(result.data[1].status).toBe("OFFLINE");
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it("should return empty array when user has no racks", async () => {
      const mockResponse: GetAllRacksResponseDTO = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getAllUserRack(mockRefetch);

      expect(result.data).toHaveLength(0);
      expect(result.data).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
    });

    it("should throw error on authentication failure", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Unauthorized: Invalid token" },
        status: 401,
      });

      await expect(rackService.getAllUserRack(mockRefetch)).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("should throw error on network failure", async () => {
      mockRefetch.mockRejectedValue(new Error("Network timeout"));

      await expect(rackService.getAllUserRack(mockRefetch)).rejects.toThrow(
        "Network timeout",
      );
    });

    it("should handle multiple racks with mixed statuses", async () => {
      const mockResponse: GetAllRacksResponseDTO = {
        data: [
          {
            id: "clx123abc456",
            name: "Living Room Farm",
            macAddress: "00:1A:2B:3C:4D:5E",
            status: "ONLINE",
            lastSeenAt: "2025-02-01T10:30:00.000Z",
          },
          {
            id: "clx456def789",
            name: "Kitchen Farm",
            macAddress: "00:1A:2B:3C:4D:5F",
            status: "OFFLINE",
            lastSeenAt: "2025-01-31T08:00:00.000Z",
          },
          {
            id: "clx789ghi012",
            name: "Bedroom Farm",
            macAddress: "00:1A:2B:3C:4D:60",
            status: "ONLINE",
            lastSeenAt: "2025-02-01T09:00:00.000Z",
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getAllUserRack(mockRefetch);

      expect(result.data).toHaveLength(3);
      const onlineRacks = result.data.filter((r) => r.status === "ONLINE");
      const offlineRacks = result.data.filter((r) => r.status === "OFFLINE");
      expect(onlineRacks).toHaveLength(2);
      expect(offlineRacks).toHaveLength(1);
    });

    it("should throw error when no data received", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: null,
        status: 200,
      });

      await expect(rackService.getAllUserRack(mockRefetch)).rejects.toThrow(
        "No data received",
      );
    });

    it("should handle paginated response with next page", async () => {
      const mockResponse: GetAllRacksResponseDTO = {
        data: [
          {
            id: "clx123abc456",
            name: "Living Room Farm",
            macAddress: "00:1A:2B:3C:4D:5E",
            status: "ONLINE",
            lastSeenAt: "2025-02-01T10:30:00.000Z",
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 45,
          itemsPerPage: 10,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await rackService.getAllUserRack(mockRefetch);

      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.totalItems).toBe(45);
    });

    it("should handle server error response", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Failed to fetch racks" },
        status: 500,
      });

      await expect(rackService.getAllUserRack(mockRefetch)).rejects.toThrow(
        "Failed to fetch racks",
      );
    });
  });
});
