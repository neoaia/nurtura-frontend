import { typography } from "@/assets/fonts/Text";
import NotificationItem from "@/components/notifications/notificationItem";
import useFetch from "@/hooks/useFetch";
import { notificationService } from "@/services/notificationService";
import {
  NotificationItemDTO,
  NotificationsResponseDTO,
} from "@/types/notification.dto";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import { ActivityIndicator, SectionList, Text, View } from "react-native";

// Grouping function adapted from RackActivity
const groupNotificationsByDate = (data: NotificationItemDTO[]) => {
  const groups: { [key: string]: NotificationItemDTO[] } = {};
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterday = today - 86400000;

  data.forEach((item) => {
    // Adjust 'createdAt' or 'timestamp' based on your actual NotificationItemDTO property
    const dateValue = (item as any).createdAt || (item as any).timestamp;
    const itemDate = new Date(dateValue).setHours(0, 0, 0, 0);
    let title = "";

    if (itemDate === today) title = "Today";
    else if (itemDate === yesterday) title = "Yesterday";
    else
      title = new Date(itemDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    if (!groups[title]) groups[title] = [];
    groups[title].push(item);
  });

  return Object.keys(groups).map((date) => ({
    title: date,
    data: groups[date],
  }));
};

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

  const sections = groupNotificationsByDate(notifications);

  return (
    <View className="flex-1 bg-white">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <NotificationItem {...item} />
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-white py-3 px-6">
            <Text className="text-black" style={typography["h2-bold"]}>
              {title}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}
