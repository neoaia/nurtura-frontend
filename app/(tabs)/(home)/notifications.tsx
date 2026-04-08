import { typography } from "@/assets/fonts/Text";
import NotificationItem from "@/components/notifications/notificationItem";
import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import { notificationService } from "@/services/notificationService";
import {
  NotificationItemDTO,
  NotificationsResponseDTO,
} from "@/types/notification.dto";
import { Notification } from "@/types/socket.interface";
import { socketService } from "@/utils/websocket/socket";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
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
    const dateValue = (item as any).createdAt;
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
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItemDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Track kung mayroong unread notifications na kailangang i-mark as read on exit
  const hasUnreadRef = useRef(false);

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

  // ── useFetch hooks ─────────────────────────────────────────────────────────
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

  // ── Socket Handler ─────────────────────────────────────────────────────────
  const onUserNotification = useRef((data: { notification: Notification }) => {
    const incoming = data.notification;

    const newItem: NotificationItemDTO = {
      id: incoming.id,
      ...(incoming as any),
      status: "UNREAD",
    };

    // I-prepend agad ang bagong notification sa listahan
    setNotifications((prev) => [newItem, ...prev]);

    // May pumasok na bago, kailangan itong i-mark as read mamaya pag exit
    hasUnreadRef.current = true;
  }).current;

  // ── Socket Setup ───────────────────────────────────────────────────────────
  const setupSocket = useCallback(async () => {
    if (!user?.token) return;

    try {
      await socketService.connect(user.token);

      // Idempotent listener (iwas duplicate fires)
      socketService.off("userNotification", onUserNotification);
      socketService.on("userNotification", onUserNotification);

      socketService.subscribeToUserNotifications();
    } catch (error) {
      console.error("Socket setup failed in NotificationScreen:", error);
    }
  }, [user?.token, onUserNotification]);

  // ── Fetch Logic ────────────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response: NotificationsResponseDTO =
        await notificationService.getAllNotifications(fetchNotifications);

      if (response?.data) {
        setNotifications(response.data);

        // Alamin kung may unread items sa initial load
        const hasUnread = response.data.some((n) => n.status === "UNREAD");
        hasUnreadRef.current = hasUnread;
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  // ── Focus Effect ───────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      // 1. Fetch initial HTTP data
      loadNotifications();

      // 2. Setup WebSocket para sa real-time incoming
      setupSocket();

      // 3. Cleanup at On-Exit Actions
      return () => {
        // Alisin ang listener at subscription kapag umalis ng screen
        socketService.off("userNotification", onUserNotification);
        socketService.unsubscribeFromUserNotifications();

        // I-trigger ang PATCH kapag UMAALIS ng screen (on exit) kung may naiwang unread
        if (hasUnreadRef.current) {
          notificationService
            .markReadAllNotifications(markAllRead)
            .catch((err) =>
              console.error("Failed to mark notifications as read:", err),
            );
          hasUnreadRef.current = false;
        }
      };
    }, [loadNotifications, setupSocket, markAllRead, onUserNotification]),
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
