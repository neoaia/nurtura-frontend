import NotificationItem from "@/components/notifications/notificationItem";
import { NotificationItemDTO } from "@/types/home.dto";
import { useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { FlatList, View } from "react-native";

export default function NotificationScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          height: 110,
          paddingBottom: 10,
          paddingTop: 15,
          display: "flex",
        },
      });
    };
  }, [navigation]);

  // mock notifications data
  const [notifications] = useState<NotificationItemDTO[]>([
    {
      id: "1",
      type: "water",
      plantName: "Lettuce",
      value: "200",
      time: "2h ago",
    },
    {
      id: "2",
      type: "light",
      plantName: "Tomato",
      value: "80",
      time: "5m ago",
    },
    {
      id: "3",
      type: "harvest",
      plantName: "Basil",
      value: "150",
      time: "1d ago",
    },
    {
      id: "4",
      type: "sensor",
      plantName: "Cucumber",
      metric: "moisture",
      value: "30",
      time: "30m ago",
    },
    {
      id: "5",
      type: "environment",
      rackName: "Rack A",
      component: "Temperature Sensor",
      value: "85",
      time: "10m ago",
    },
    {
      id: "6",
      type: "info",
      time: "Just now",
    },
    {
      id: "7",
      type: "info",
      time: "Just now",
    },
  ]);

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem {...item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
