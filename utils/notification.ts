import useFetch from "@/hooks/useFetch";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type SavePushTokenResponse = {
  message?: string;
};

const resolveProjectId = (): string | undefined => {
  const envProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return envProjectId
};

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    alert("Push notifications require a physical device.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Push notification permission was denied.");
    return null;
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    console.warn("Missing EAS projectId for push token registration.");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const expoPushToken: string = tokenData.data;
  console.log("Expo Push Token:", expoPushToken);

  return expoPushToken;
}

export function useRegisterForPushNotifications() {
  const {
    refetch: saveToken,
    loading,
    error,
  } = useFetch<SavePushTokenResponse>("/users/save-token", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const registerForPushNotifications = useCallback(
    async (userId: string): Promise<string | null> => {
      const expoPushToken = await getExpoPushToken();
      if (!expoPushToken) {
        return null;
      }

      const result = await saveToken({
        body: { userId, expoPushToken },
      });

      if (result.error) {
        console.error("Failed to save expo push token:", result.error);
        return null;
      }

      return expoPushToken;
    },
    [saveToken],
  );

  return { registerForPushNotifications, loading, error };
}
