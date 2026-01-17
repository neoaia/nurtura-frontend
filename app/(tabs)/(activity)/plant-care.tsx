import { ActivityItem } from "@/components/activity/activityItem";
import { ActivityButton } from "@/components/activity/sensorToggle";
import { DateRangePicker } from "@/components/shared/datetimepicker";

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlantCareScreen() {
  const [activeTab, setActiveTab] = useState<"water" | "light">("water");
  const dateToday = new Date();

  const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* date range calender */}
        <View className="px-6 mt-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </View>

        {/* send=sor toggle */}
        <View className="flex-row justify-center mb-3 mt-4">
          <ActivityButton
            status={activeTab === "water" ? "clickedWater" : "defaultWater"}
            onPress={() => setActiveTab("water")}
          />
          <ActivityButton
            status={activeTab === "light" ? "clickedLight" : "defaultLight"}
            onPress={() => setActiveTab("light")}
          />
        </View>

        {/* activty itemss */}
        <View className="px-6 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              {formatDate(dateToday)}
            </Text>
            <Ionicons name="swap-vertical" size={20} color="#619AAC" />
          </View>

          <ActivityItem
            type={activeTab}
            plantName="Cherry Tomato"
            rackName="Greens Rack"
            location="Lily Pod Garden"
            time="9:00 AM"
            duration="2 mins"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}