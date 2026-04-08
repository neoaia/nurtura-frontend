import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket.interface";
import { createLogger } from "@/utils/logger";
import { io, Socket } from "socket.io-client";

const logger = createLogger("SocketService");

const SOCKET_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL
  ? process.env.EXPO_PUBLIC_WEBSOCKET_URL
  : "ws://localhost:3000";

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private token: string | null = null;
  private isConnecting: boolean = false;

  // Tracks whether the initial connect() promise has already settled.
  // Prevents calling resolve/reject multiple times across retry attempts.
  private connectionSettled: boolean = false;

  private eventListeners: Map<
    keyof ServerToClientEvents,
    ServerToClientEvents[keyof ServerToClientEvents][]
  > = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve) => {
      // ─── Already connected ───────────────────────────────────────────────
      if (this.socket?.connected) {
        logger.log("Socket already connected");
        return resolve();
      }

      // ─── Connection already in progress ──────────────────────────────────
      if (this.isConnecting) {
        logger.log("Socket connection already in progress");
        return resolve();
      }

      this.isConnecting = true;
      this.connectionSettled = false;
      this.token = token;

      logger.log("Initializing socket connection", {
        socketUrl: SOCKET_URL,
        namespace: "/updates",
        hasToken: Boolean(this.token),
      });

      this.socket = io(`${SOCKET_URL}/updates`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 10000,
        timeout: 30000,
        auth: {
          token: this.token,
        },
      });

      // ─── Connected ───────────────────────────────────────────────────────
      this.socket.on("connect", () => {
        logger.log("Connected successfully", { socketId: this.socket?.id });
        this.restoreEventListeners();
        this.isConnecting = false;

        if (!this.connectionSettled) {
          this.connectionSettled = true;
          resolve();
        }
      });

      // ─── Connection error ─────────────────────────────────────────────────
      // We intentionally do NOT reject the promise here.
      //
      // Rejecting would require every caller to wrap connect() in try/catch.
      // If they forget, the unhandled rejection crashes the app.
      //
      // Instead: log a warning, mark connecting as false, and let the
      // socket's built-in reconnection logic handle recovery silently.
      // The app stays running and the UI reflects the offline state via
      // isConnectedToServer().
      this.socket.on("connect_error", (error) => {
        logger.warn("Socket connection failed — will retry automatically", {
          message: error.message,
          socketUrl: SOCKET_URL,
        });
        this.isConnecting = false;

        // Resolve (not reject) so the caller is unblocked and the app
        // continues to function. The socket will retry on its own.
        if (!this.connectionSettled) {
          this.connectionSettled = true;
          resolve();
        }
      });

      // ─── Disconnected ─────────────────────────────────────────────────────
      this.socket.on("disconnect", (reason) => {
        logger.warn("Socket disconnected", {
          reason,
          socketId: this.socket?.id,
        });
      });

      // ─── Reconnection failed ──────────────────────────────────────────────
      // Fires when all reconnectionAttempts have been exhausted.
      // This is a Manager-level event, so it must be listened on socket.io
      // (the Manager instance), not on the socket itself.
      this.socket.io.on("reconnect_failed", () => {
        logger.warn(
          "Socket reconnection failed — max attempts reached, giving up",
        );
        this.isConnecting = false;
        this.socket?.disconnect();
        this.socket?.removeAllListeners();
        this.socket = null;
      });

      // ─── Server acknowledgement ───────────────────────────────────────────
      this.socket.on("connected", (data) => {
        logger.log("Server acknowledged connection", data);
      });

      // ─── Server-emitted error event ───────────────────────────────────────
      // This is a logical error from the server (e.g. auth failure),
      // not a connection error. Log it — do not throw.
      this.socket.on("error", (data) => {
        logger.warn("Socket server error event received", data);
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
      this.connectionSettled = false;
      this.eventListeners.clear();
      logger.log("Socket disconnected successfully");
    }
  }

  subscribeToRack(rackId: string): void {
    if (!this.socket?.connected) {
      logger.warn("Cannot subscribe to rack — socket not connected", {
        rackId,
      });
      return;
    }

    logger.log("Subscribing to rack", { rackId });
    this.socket.emit("subscribeToRack", { rackId });
  }

  unsubscribeFromRack(rackId: string): void {
    if (!this.socket?.connected) {
      logger.warn("Cannot unsubscribe from rack — socket not connected", {
        rackId,
      });
      return;
    }

    logger.log("Unsubscribing from rack", { rackId });
    this.socket.emit("unsubscribeFromRack", { rackId });
  }

  getStatus(): void {
    logger.log("Requesting socket status from server");
    this.socket?.emit("getStatus");
  }

  on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K],
  ): void {
    if (!this.socket) {
      logger.warn(
        `Cannot register listener for "${event}" — socket not initialized`,
      );
      return;
    }

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)?.push(callback);
    logger.debug("Registering socket event listener", {
      event,
      listenerCount: this.eventListeners.get(event)?.length ?? 0,
    });
    this.socket.on(event, callback as any);
  }

  off<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: ServerToClientEvents[K],
  ): void {
    if (!this.socket) {
      logger.warn(
        `Cannot remove listener for "${event}" — socket not initialized`,
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

        logger.debug("Removed socket event listener", {
          event,
          listenerCount: listeners.length,
        });
      }
    } else {
      this.socket.off(event);
      this.eventListeners.delete(event);
      logger.debug("Removed all listeners for socket event", { event });
    }
  }

  isConnectedToServer(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | null {
    return this.socket?.id ?? null;
  }

  subscribeToUserNotifications(): void {
    if (!this.socket?.connected) {
      logger.warn(
        "Cannot subscribe to user notifications — socket not connected",
      );
      return;
    }

    logger.log("Subscribing to user notifications");
    this.socket.emit("subscribeToUserNotifications");
  }

  unsubscribeFromUserNotifications(): void {
    if (!this.socket?.connected) {
      logger.warn(
        "Cannot unsubscribe from user notifications — socket not connected",
      );
      return;
    }

    logger.log("Unsubscribing from user notifications");
    this.socket.emit("unsubscribeFromUserNotifications");
  }

  subscribeToUserNotificationsAck(): void {
    if (!this.socket?.connected) {
      logger.warn(
        "Cannot subscribe to user notifications acknowledgment — socket not connected",
      );
      return;
    }

    logger.log("Subscribing to user notifications acknowledgment");
    this.socket.emit("subscribeToUserNotificationsAck");
  }

  unsubscribeFromUserNotificationsAck(): void {
    if (!this.socket?.connected) {
      logger.warn(
        "Cannot unsubscribe from user notifications acknowledgment — socket not connected",
      );
      return;
    }

    logger.log("Unsubscribing from user notifications acknowledgment");
    this.socket.emit("unsubscribeFromUserNotificationsAck");
  }

  private restoreEventListeners(): void {
    logger.log("Restoring event listeners after reconnection");
    this.eventListeners.forEach((listeners, event) => {
      logger.debug("Rebinding listeners", {
        event,
        listenerCount: listeners.length,
      });
      listeners.forEach((callback) => {
        this.socket?.on(event, callback as any);
      });
    });
  }
}

export const socketService = new SocketService();
