import { createLogger } from "@/utils/logger";
import * as Notifications from "expo-notifications";
import { Href, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

const logger = createLogger("useNotificationHandler");

type AppNotificationData = {
  screen?: string;
  roomId?: string;
  orderId?: string;
  rackId?: string;
  severity?: string;
  type?: string;
} & Record<string, unknown>;

type UseNotificationHandlerOptions = {
  requestPermissionOnMount?: boolean;
  onPermissionResolved?: (status: Notifications.PermissionStatus) => void;
  onWarning?: (data: AppNotificationData) => void;
  onReceived?: (
    notification: Notifications.Notification,
    data: AppNotificationData,
  ) => void;
};

const getString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const toAppData = (data: Record<string, unknown>): AppNotificationData => {
  return {
    ...data,
    screen: getString(data.screen),
    roomId: getString(data.roomId),
    orderId: getString(data.orderId),
    rackId: getString(data.rackId),
    severity: getString(data.severity),
    type: getString(data.type),
  };
};

const isWarningLike = (data: AppNotificationData): boolean => {
  const severity = data.severity?.toLowerCase();
  const type = data.type?.toLowerCase();

  return (
    severity === "warning" ||
    severity === "error" ||
    type === "warning" ||
    type === "environment" ||
    type === "sensor"
  );
};

const getRouteFromData = (data: AppNotificationData): Href | null => {
  return data.screen as Href;
};

export function useNotificationHandler(
  options?: UseNotificationHandlerOptions,
): void {
  const router = useRouter();
  const optionsRef = useRef<UseNotificationHandlerOptions | undefined>(options);
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const lastHandledResponseIdRef = useRef<string | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      optionsRef.current?.onPermissionResolved?.(finalStatus);

      if (finalStatus !== "granted") {
        logger.warn("Push notification permission not granted", {
          status: finalStatus,
        });
      }
    };

    const setupNotificationChannel = async () => {
      if (Platform.OS !== "android") {
        return;
      }

      await Notifications.setNotificationChannelAsync("alerts", {
        name: "Alerts",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 300, 200, 300],
        lightColor: "#E11D48",
      });
    };

    const handleResponse = async (
      response: Notifications.NotificationResponse,
    ) => {
      const responseId = response.notification.request.identifier;

      if (lastHandledResponseIdRef.current === responseId) {
        return;
      }

      lastHandledResponseIdRef.current = responseId;

      const rawData = response.notification.request.content.data as Record<
        string,
        unknown
      >;
      const data = toAppData(rawData);
      const route = getRouteFromData(data);

      if (route) {
        router.push(route);
      }

      await Notifications.clearLastNotificationResponseAsync();
    };

    const bootstrap = async () => {
      await setupNotificationChannel();

      if (optionsRef.current?.requestPermissionOnMount !== false) {
        await requestPermissions();
      }

      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        await handleResponse(lastResponse);
      }
    };

    bootstrap().catch((error: unknown) => {
      logger.error("Failed to initialize notification handler", error);
    });

    // Notification arrives while app is OPEN
    notifListener.current = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        const rawData = notification.request.content.data as Record<
          string,
          unknown
        >;
        const data = toAppData(rawData);

        optionsRef.current?.onReceived?.(notification, data);

        if (isWarningLike(data)) {
          optionsRef.current?.onWarning?.(data);
          logger.warn("Warning notification received", data);
        } else {
          logger.log("Notification received", data);
        }
      },
    );

    // User TAPS the notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        void handleResponse(response);
      });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);
}
