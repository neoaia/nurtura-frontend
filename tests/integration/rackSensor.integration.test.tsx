import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockUseAuth = jest.fn();
const eventHandlers = new Map<string, Function>();

const mockSocketService = {
  connect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn((event: string, callback: Function) => {
    eventHandlers.set(event, callback);
  }),
  off: jest.fn((event: string) => {
    eventHandlers.delete(event);
  }),
  subscribeToRack: jest.fn(),
  unsubscribeFromRack: jest.fn(),
};

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/utils/websocket/socket", () => ({
  socketService: mockSocketService,
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useRackSensor } = require("../../hooks/useRackSensor");

describe("useRackSensor integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventHandlers.clear();
    mockUseAuth.mockReturnValue({
      user: {
        uid: "user-1",
        token: "token-1",
      },
    });
  });

  it("connects and subscribes when rack and user are available", async () => {
    renderHook(() => useRackSensor("rack-1"));

    await waitFor(() => {
      expect(mockSocketService.connect).toHaveBeenCalledWith("token-1");
      expect(mockSocketService.subscribeToRack).toHaveBeenCalledWith(
        "rack-1",
        "user-1",
      );
    });
  });

  it("updates reading and device status from socket events", async () => {
    const { result } = renderHook(() => useRackSensor("rack-1"));

    await waitFor(() => {
      expect(mockSocketService.on).toHaveBeenCalled();
    });

    await act(async () => {
      eventHandlers.get("sensorData")?.({
        rackId: "rack-1",
        data: { temp: 25, humidity: 55 },
      });
      eventHandlers.get("deviceStatus")?.({
        rackId: "rack-1",
        status: "ONLINE",
      });
    });

    expect(result.current.reading).toEqual({ temp: 25, humidity: 55 });
    expect(result.current.deviceStatus).toBe("ONLINE");
  });

  it("unsubscribes on unmount", async () => {
    const { unmount } = renderHook(() => useRackSensor("rack-1"));

    await waitFor(() => {
      expect(mockSocketService.subscribeToRack).toHaveBeenCalled();
    });

    unmount();

    expect(mockSocketService.unsubscribeFromRack).toHaveBeenCalledWith(
      "rack-1",
    );
  });
});
