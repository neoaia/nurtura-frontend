import { act, renderHook } from "@testing-library/react-native";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import { activityService } from "../../services/activityService";
import { plantService } from "../../services/plantService";
import { rackService } from "../../services/rackService";

jest.mock("../../lib/firebaseAuth", () => ({
  getFirebaseIdToken: jest.fn().mockResolvedValue("token-xyz"),
}));

jest.mock("axios", () => {
  const mockAxios = jest.fn();
  (mockAxios as any).isCancel = jest.fn(() => false);
  return mockAxios;
});

const mockedAxios = axios as unknown as jest.Mock & { isCancel: jest.Mock };

describe("service + useFetch integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_URL = "api.example.com";
    delete process.env.EXPO_PUBLIC_LOCAL_IP_ADDRESS;
  });

  it("plantService consumes refetch from useFetch", async () => {
    mockedAxios.mockResolvedValue({
      data: {
        data: [],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        amount: 0,
      },
      status: 200,
    });

    const { result } = renderHook(() =>
      useFetch("/plants/activities/care", {
        method: "GET",
        withAuth: true,
        autoFetch: false,
      }),
    );

    let response: any;
    await act(async () => {
      response = await plantService.getPlantCareActivities(
        result.current.refetch,
        {
          page: 1,
          limit: 10,
        },
      );
    });

    expect(response.amount).toBe(0);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https:/api.example.com/plants/activities/care",
        method: "GET",
        params: { page: 1, limit: 10 },
      }),
    );
  });

  it("rackService consumes refetch from useFetch", async () => {
    mockedAxios.mockResolvedValue({
      data: {
        data: [],
      },
      status: 200,
    });

    const { result } = renderHook(() =>
      useFetch("/racks", {
        method: "GET",
        withAuth: true,
        autoFetch: false,
      }),
    );

    await act(async () => {
      await rackService.getAllUserRack(result.current.refetch);
    });

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https:/api.example.com/racks",
        method: "GET",
      }),
    );
  });

  it("activityService consumes refetch from useFetch with params", async () => {
    mockedAxios.mockResolvedValue({
      data: {
        data: [],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        amount: 0,
      },
      status: 200,
    });

    const { result } = renderHook(() =>
      useFetch("/racks/activities", {
        method: "GET",
        withAuth: true,
        autoFetch: false,
      }),
    );

    await act(async () => {
      await activityService.getRackActivities(result.current.refetch, {
        page: 2,
        limit: 5,
      });
    });

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https:/api.example.com/racks/activities",
        method: "GET",
        params: { page: 2, limit: 5 },
      }),
    );
  });
});
