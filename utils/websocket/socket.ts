import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket.interface";
import { createLogger } from "@/utils/logger";
import { io, Socket } from "socket.io-client";

const logger = createLogger("SocketService");
const SOCKET_URL = process.env.EXPO_PUBLIC_LOCAL_IP_ADDRESS
  ? `ws://${process.env.EXPO_PUBLIC_LOCAL_IP_ADDRESS}:3000`
  : "ws://localhost:3000";

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private token: string | null = null;
  private isConnecting: boolean = false;
  private eventListeners: Map<
    keyof ServerToClientEvents,
    ServerToClientEvents[keyof ServerToClientEvents][]
  > = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        logger.log("Socket already connected");
        return resolve();
      }

      if (this.isConnecting) {
        logger.log("Socket connection in progress");
        return resolve();
      }

      this.isConnecting = true;
      this.token = token;

      this.socket = io(`${SOCKET_URL}/sensors`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 10000,
        timeout: 30000,
        auth: {
          token: this.token,
        },
      });

      this.socket.on("connect", () => {
        logger.log("Connected successfully", { socketId: this.socket?.id });
        this.restoreEventListeners();
        this.isConnecting = false;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        logger.error("Connection error", error.message);
        logger.error("Connection details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
          type: error.constructor.name,
        });
        this.isConnecting = false;
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        logger.warn("Socket disconnected", { reason });
      });

      this.socket.on("connected", (data) => {
        logger.log("Server acknowledged connection", data);
      });

      this.socket.on("error", (data) => {
        logger.error("Socket error event received", data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      logger.log("Disconnecting socket");
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.token = null;
      this.eventListeners.clear();
      logger.log("Socket disconnected successfully");
    }
  }

  subscribeToRack(rackId: string, userId: string): void {
    if (!this.socket?.connected) {
      logger.error("Cannot subscribe to rack - socket not connected");
      return;
    }

    logger.log("Subscribing to rack", { rackId, userId });
    this.socket.emit("subscribeToRack", { rackId, userId });
  }

  unsubscribeFromRack(rackId: string): void {
    if (!this.socket?.connected) {
      logger.error("Cannot unsubscribe from rack - socket not connected");
      return;
    }

    logger.log("Unsubscribing from rack", { rackId });
    this.socket.emit("unsubscribeFromRack", { rackId });
  }

  getStatus(): void {
    this.socket?.emit("getStatus");
  }

  on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K],
  ): void {
    if (!this.socket) {
      logger.error(
        `Cannot register event listener for ${event} - socket not initialized`,
      );
      return;
    }

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)?.push(callback);
    this.socket.on(event, callback as any);
  }

  off<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: ServerToClientEvents[K],
  ): void {
    if (!this.socket) {
      logger.error(
        `Cannot remove event listener for ${event} - socket not initialized`,
      );
      return;
    }

    if (callback) {
      this.socket.off(event, callback as any);

      const listeners = this.eventListeners.get(event);

      if (listeners) {
        const index = listeners.indexOf(
          callback as ServerToClientEvents[keyof ServerToClientEvents],
        );
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event);
      this.eventListeners.delete(event);
    }
  }

  isConnectedToServer(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  private restoreEventListeners(): void {
    logger.log("Restoring event listeners after reconnection");
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach((callback) => {
        this.socket?.on(event, callback as any);
      });
    });
  }
}

export const socketService = new SocketService();
