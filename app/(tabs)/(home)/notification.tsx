import NotificationItem from "@/components/notifications/notificationItem";
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationScreen() {
  const navigation = useNavigation();

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

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 bg-white">
          <NotificationItem
            type="water"
            plantName="Lettuce"
            value="200"
            time="2h ago"
          />
          <NotificationItem
            type="light"
            plantName="Tomato"
            value="80"
            time="5m ago"
          />
          <NotificationItem
            type="harvest"
            plantName="Basil"
            value="150"
            time="1d ago"
          />
          <NotificationItem
            type="sensor"
            plantName="Cucumber"
            metric="moisture"
            value="30"
            time="30m ago"
          />
          <NotificationItem
            type="environment"
            rackName="Rack A"
            component="Temperature Sensor"
            value="85"
            time="10m ago"
          />
          <NotificationItem type="info" time="Just now" />
          <NotificationItem type="info" time="Just now" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
