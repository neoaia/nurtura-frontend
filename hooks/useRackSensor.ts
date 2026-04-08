import { useAuth } from "@/contexts/AuthContext";
import type { SensorReading } from "@/types/socket.interface";
import { createLogger } from "@/utils/logger";
import { socketService } from "@/utils/websocket/socket";
import { useEffect, useMemo, useState } from "react";

const logger = createLogger("useRackSensor");

export const useRackSensor = (rackId?: string) => {
  const { user } = useAuth();
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubscribe = useMemo(
    () => Boolean(rackId && user?.uid && user?.token),
    [rackId, user?.uid, user?.token],
  );

  useEffect(() => {
    if (!canSubscribe || !rackId || !user?.uid || !user?.token) {
      return;
    }

    let isMounted = true;

    const handleInitialData = (data: {
      rackId: string;
      data: SensorReading | null;
    }) => {
      if (!isMounted || data.rackId !== rackId) {
        return;
      }

      setReading(data.data);
    };

    const handleSensorData = (data: {
      rackId: string;
      data: SensorReading;
    }) => {
      if (!isMounted || data.rackId !== rackId) {
        return;
      }

      setReading(data.data);
    };

    const handleDeviceStatus = (data: { rackId: string; status: string }) => {
      if (!isMounted || data.rackId !== rackId) {
        return;
      }

      setDeviceStatus(data.status);
    };

    const handleSocketError = (data: { message: string; error: Error }) => {
      if (!isMounted) {
        return;
      }

      setError(data.message || data.error?.message || "Socket error");
    };

    const setup = async () => {
      try {
        await socketService.connect(user.token || "");

        if (!isMounted) {
          return;
        }

        socketService.on("initialData", handleInitialData);
        socketService.on("sensorData", handleSensorData);
        socketService.on("deviceStatus", handleDeviceStatus);
        socketService.on("error", handleSocketError);

        socketService.subscribeToRack(rackId);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to connect socket", message);
        setError(message);
      }
    };

    setup();

    return () => {
      isMounted = false;
      socketService.off("initialData", handleInitialData);
      socketService.off("sensorData", handleSensorData);
      socketService.off("deviceStatus", handleDeviceStatus);
      socketService.off("error", handleSocketError);

      if (rackId) {
        socketService.unsubscribeFromRack(rackId);
      }
    };
  }, [canSubscribe, rackId, user?.uid, user?.token]);

  return {
    reading,
    deviceStatus,
    error,
  };
};
