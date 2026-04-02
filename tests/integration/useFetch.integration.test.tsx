import { act, renderHook, waitFor } from "@testing-library/react-native";
import axios from "axios";
import useFetch from "../../hooks/useFetch";

jest.mock("../../lib/firebaseAuth", () => ({
  getFirebaseIdToken: jest.fn(),
}));

jest.mock("axios", () => {
  const mockAxios = jest.fn();
  (mockAxios as any).isCancel = jest.fn(() => false);
  return mockAxios;
});

const { getFirebaseIdToken } = jest.requireMock("../../lib/firebaseAuth") as {
  getFirebaseIdToken: jest.Mock;
};

const mockedAxios = axios as unknown as jest.Mock & { isCancel: jest.Mock };

describe("useFetch integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_URL = "api.example.com";
    delete process.env.EXPO_PUBLIC_LOCAL_IP_ADDRESS;
  });

  it("sends GET request with auth token and params", async () => {
    getFirebaseIdToken.mockResolvedValue("token-123");
    mockedAxios.mockResolvedValue({
      data: { items: [1, 2, 3] },
      status: 200,
    });

    const { result } = renderHook(() =>
      useFetch("/plants/activities/care", {
        method: "GET",
        autoFetch: false,
        withAuth: true,
      }),
    );

    let response: any;
    await act(async () => {
      response = await result.current.refetch({
        params: { page: 1, limit: 10 },
      });
    });

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https:/api.example.com/plants/activities/care",
        method: "GET",
        params: { page: 1, limit: 10 },
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(response).toEqual({
      data: { items: [1, 2, 3] },
      error: null,
      status: 200,
    });
  });

  it("sends non-GET payload in request body", async () => {
    mockedAxios.mockResolvedValue({
      data: { message: "Created" },
      status: 200,
    });

    const { result } = renderHook(() =>
      useFetch("/plants", { method: "POST", autoFetch: false }),
    );

    await act(async () => {
      await result.current.refetch({
        method: "POST",
        body: { name: "Lettuce" },
      });
    });

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        data: { name: "Lettuce" },
      }),
    );
  });

  it("maps axios errors into hook error state", async () => {
    mockedAxios.mockRejectedValue({
      message: "Request failed with status code 401",
      response: {
        status: 401,
        data: { message: "Unauthorized" },
      },
    });

    const { result } = renderHook(() =>
      useFetch("/protected", { method: "GET", autoFetch: false }),
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toEqual({
        message: "Unauthorized",
        status: 401,
      });
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});
