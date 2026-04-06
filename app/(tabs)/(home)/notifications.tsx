import NotificationItem from "@/components/notifications/notificationItem";
import useFetch from "@/hooks/useFetch";
import {
  BackendNotificationsResponseDTO,
  NotificationItemDTO,
} from "@/types/home.dto";
import { useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

const toRelativeTime = (dateInput: string): string => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "Just now";
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)}m ago`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)}h ago`;
  }

  return `${Math.floor(diffMs / day)}d ago`;
};

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { data, loading, error } = useFetch<BackendNotificationsResponseDTO>(
    "/notifications",
    {
      method: "GET",
      withAuth: true,
      autoFetch: true,
      params: {
        page: 1,
        limit: 20,
      },
    },
  );

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

  const notifications = useMemo<NotificationItemDTO[]>(() => {
    return (
      data?.data?.map((item) => ({
        id: item.id,
        type: "alert",
        title: item.title,
        message: item.message,
        status: item.status,
        time: toRelativeTime(item.createdAt),
      })) ?? []
    );
  }, [data]);

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#31511E" />
        </View>
      ) : null}

      {!loading && error ? (
        <View className="px-6 pt-8">
          <Text className="text-red-500">Failed to load notifications.</Text>
        </View>
      ) : null}

      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem {...item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? (
            <View className="px-6 pt-8">
              <Text className="text-gray-500">No notifications yet.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
