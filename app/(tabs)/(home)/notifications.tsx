import NotificationItem from "@/components/notifications/notificationItem";
import useFetch from "@/hooks/useFetch";
import { notificationService } from "@/services/notificationService";
import {
  NotificationItemDTO,
  NotificationsResponseDTO,
} from "@/types/notification.dto";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<NotificationItemDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          height: 100,
          paddingBottom: 10,
          paddingTop: 15,
          display: "flex",
        },
      });
    };
  }, [navigation]);

  const { refetch: fetchNotifications } = useFetch("/notifications", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: markAllRead } = useFetch("/notifications/read-all", {
    method: "PATCH",
    autoFetch: false,
    withAuth: true,
  });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response: NotificationsResponseDTO =
        await notificationService.getAllNotifications(fetchNotifications);

      if (response?.data) {
        setNotifications(response.data);

        const hasUnread = response.data.some((n) => n.status === "UNREAD");
        if (hasUnread) {
          await notificationService.markReadAllNotifications(markAllRead);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications, markAllRead]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="small" color="#86975A" />
      </View>
    );
  }

  if (!loading && notifications.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-grayText text-center">
          You have no notifications yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem {...item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
