import { typography } from "@/assets/fonts/Text";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationIcon from "../../../assets/images/notificationIcon.png";
import { Highlight } from "../../../components/home/highlight";
import { RecentActivityBar } from "../../../components/home/recentActivityBar";
import { SummaryCard } from "../../../components/home/summaryCard";
import { useHome } from "../../../hooks/useHome";

export default function HomeScreen() {
  const { data, loading, error, refetch, addRack, getNotifications } =
    useHome();

  const handleNotificationPress = async () => {
    try {
      const notifications = await getNotifications();
      console.log("Notifications:", notifications);
      router.push("/notifications");
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleCardPress = (cardType: string) => {
    console.log("Card pressed:", cardType);
    // TODO: Navigate to detail screen based on cardType
    // if (cardType === 'racks') router.push('/(tabs)/racks');
    // if (cardType === 'plants') router.push('/(tabs)/plants');
  };

  const handleAddRack = async () => {
    try {
      const result = await addRack({ name: "New Rack" });
      if (result.success) {
        console.log("Rack added successfully");
        // TODO: Show success message to user
      }
    } catch (error) {
      console.error("Failed to add rack:", error);
      // TODO: Show error message to user
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#7a8f5e] items-center justify-center">
        <Text style={typography.body} className="text-white">
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#7a8f5e] items-center justify-center px-6">
        <Text
          style={typography["h2-bold"]}
          className="text-white mb-4 text-center"
        >
          Oops! Something went wrong
        </Text>
        <Text style={typography.body} className="text-white mb-6 text-center">
          {error}
        </Text>
        <TouchableOpacity
          onPress={refetch}
          className="bg-white px-6 py-3 rounded-xl"
          activeOpacity={0.8}
        >
          <Text style={typography.button} className="text-[#7a8f5e]">
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-10 pt-4 pb-2 flex-row items-center justify-between">
          <Text style={typography["h1-bold"]} className="text-white">
            Hi {data.user.name}!
          </Text>
          <TouchableOpacity
            onPress={handleNotificationPress}
            className="relative p-2"
            activeOpacity={0.7}
          >
            <Image
              source={NotificationIcon}
              className="w-6 h-6"
              resizeMode="contain"
            />

            {data.user.hasNotifications && (
              <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="pt-4">
          <View className="px-4">
            <SummaryCard cards={data.summary} onCardPress={handleCardPress} />
          </View>

          <View className="bg-white rounded-t-2xl p-6 shadow-lg">
            <Highlight
              title={data.highlight.title}
              description={data.highlight.description}
              buttonText={data.highlight.buttonText}
              onButtonPress={handleAddRack}
            />

            <RecentActivityBar activities={data.recentActivity} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
