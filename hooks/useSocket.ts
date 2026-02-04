import { useAuth } from "@/contexts/AuthContext";
import { createLogger } from "@/utils/logger";
import { useEffect, useState, useRef } from "react";
import { socketService } from "@/utils/websocket/socket";

const logger = createLogger("useSocket");

export const useSocket = () => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const hasConnected = useRef(false);

    useEffect(() => {
        const handleDisconnect = (reason: string) => {
            setIsConnected(false);
            logger.warn("Disconnected from server", { reason });

            hasConnected.current = false;
        };

        const handleConnectError = (error: Error) => {
            setConnectionError(error.message);
            logger.error("Connection error", { message: error.message, stack: error.stack });
            hasConnected.current = false;
        };

        socketService.on("disconnect", handleDisconnect);
        socketService.on("connect_error", handleConnectError);

        if (user?.token && !hasConnected.current) {
            hasConnected.current = true;
            socketService.connect(user.token)
              .then(() => {
                setIsConnected(true);
                setConnectionError(null);
                logger.log("Socket connection established");
              })
              .catch((error) => {
                setConnectionError(error.message);
                logger.error("Failed to connect socket", { message: error.message, stack: error.stack });
                hasConnected.current = false;
              });
        }

        return () => {
            socketService.off("disconnect", handleDisconnect);
            socketService.off("connect_error", handleConnectError);

            if (hasConnected.current) {
                socketService.disconnect();
                hasConnected.current = false;
                logger.log("Socket connection closed");
                setIsConnected(false);
            }
        };
    }, [user?.token]);

    return { isConnected, connectionError, socketService };
}