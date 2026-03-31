const mockIo = jest.fn();

jest.mock("socket.io-client", () => ({
  io: (...args: any[]) => mockIo(...args),
}));

describe("socketService integration", () => {
  let socketService: any;
  let fakeSocket: any;

  beforeEach(() => {
    jest.resetModules();

    fakeSocket = {
      connected: false,
      id: "socket-1",
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      removeAllListeners: jest.fn(),
      io: {
        on: jest.fn(),
      },
    };

    mockIo.mockReturnValue(fakeSocket);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    socketService = require("../../utils/websocket/socket").socketService;
  });

  it("connects and reports status", async () => {
    let connectHandler: Function | undefined;
    fakeSocket.on.mockImplementation((event: string, cb: Function) => {
      if (event === "connect") {
        connectHandler = cb;
      }
      return fakeSocket;
    });

    const connectPromise = socketService.connect("token-abc");

    fakeSocket.connected = true;
    connectHandler?.();

    await connectPromise;

    expect(mockIo).toHaveBeenCalledWith(
      expect.stringContaining("/sensors"),
      expect.objectContaining({
        auth: { token: "token-abc" },
      }),
    );
    expect(socketService.isConnectedToServer()).toBe(true);
    expect(socketService.getSocketId()).toBe("socket-1");
  });

  it("subscribes and unsubscribes rack when connected", async () => {
    fakeSocket.connected = true;

    let connectHandler: Function | undefined;
    fakeSocket.on.mockImplementation((event: string, cb: Function) => {
      if (event === "connect") {
        connectHandler = cb;
      }
      return fakeSocket;
    });

    const connectPromise = socketService.connect("token-abc");
    connectHandler?.();
    await connectPromise;

    socketService.subscribeToRack("rack-1", "user-1");
    socketService.unsubscribeFromRack("rack-1");

    expect(fakeSocket.emit).toHaveBeenCalledWith("subscribeToRack", {
      rackId: "rack-1",
      userId: "user-1",
    });
    expect(fakeSocket.emit).toHaveBeenCalledWith("unsubscribeFromRack", {
      rackId: "rack-1",
    });
  });

  it("disconnects and clears listeners", () => {
    fakeSocket.connected = true;

    let connectHandler: Function | undefined;
    fakeSocket.on.mockImplementation((event: string, cb: Function) => {
      if (event === "connect") {
        connectHandler = cb;
      }
      return fakeSocket;
    });

    const promise = socketService.connect("token-abc");
    connectHandler?.();

    return promise.then(() => {
      socketService.disconnect();
      expect(fakeSocket.disconnect).toHaveBeenCalled();
      expect(fakeSocket.removeAllListeners).toHaveBeenCalled();
      expect(socketService.isConnectedToServer()).toBe(false);
    });
  });
});
