import { UserDetailsResponseDTO } from "@/types/user.dto";
import { userService } from "../../services/userService";

describe("userService", () => {
  let mockRefetch: jest.Mock;

  beforeEach(() => {
    mockRefetch = jest.fn();
    jest.clearAllMocks();
  });

  describe("getUser", () => {
    it("should successfully fetch user details", async () => {
      const mockResponse: UserDetailsResponseDTO = {
        message: "User details retrieved successfully",
        userInfo: {
          id: "123",
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          middleName: "Smith",
          suffix: "Jr.",
          block: "Block A",
          street: "Main Street",
          barangay: "Barangay 1",
          city: "Manila",
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await userService.getUser(mockRefetch);

      expect(result).toEqual(mockResponse);
      expect(result.userInfo.email).toBe("test@example.com");
      expect(mockRefetch).toHaveBeenCalledWith();
    });

    it("should return empty userInfo when user not found", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "User not found" },
        status: 404,
      });

      const result = await userService.getUser(mockRefetch);

      expect(result.message).toBe("User not found");
      expect(result.userInfo).toEqual({});
      expect(mockRefetch).toHaveBeenCalledWith();
    });

    it("should throw error when no data received", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: null,
        status: 200,
      });

      await expect(userService.getUser(mockRefetch)).rejects.toThrow(
        "No data received from server",
      );
    });

    it("should throw error on network failure", async () => {
      mockRefetch.mockRejectedValue(new Error("Network error"));

      await expect(userService.getUser(mockRefetch)).rejects.toThrow(
        "Network error",
      );
    });

    it("should throw error on unauthorized access", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Unauthorized: Invalid token" },
        status: 401,
      });

      await expect(userService.getUser(mockRefetch)).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("should handle user with minimal information", async () => {
      const mockResponse: UserDetailsResponseDTO = {
        message: "User details retrieved successfully",
        userInfo: {
          id: "456",
          email: "minimal@example.com",
          firstName: "Jane",
          lastName: "Smith",
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await userService.getUser(mockRefetch);
      expect(result.userInfo.email).toBe("minimal@example.com");

      expect(result.userInfo.firstName).toBe("Jane");
    });

    it("should throw error on server error", async () => {
      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: "Internal server error" },
        status: 500,
      });

      await expect(userService.getUser(mockRefetch)).rejects.toThrow(
        "Internal server error",
      );
    });
  });
});
