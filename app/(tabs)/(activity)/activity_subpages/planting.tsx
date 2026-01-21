import { PlantItem } from "@/components/activity/plantingItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";

import { typography } from "@/assets/fonts/Text";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

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
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      className="bg-white"
    >
      {/* date range calender */}
      <View className="px-6 mt-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </View>

      {/* planting itemss */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text style={typography["button-bold"]} className=" text-black">
            {formatDate(dateToday)}
          </Text>
          <Ionicons name="swap-vertical" size={20} color="#86975A" />
        </View>

        <PlantItem
          plantName="Lettuce"
          rackName="Greens Rack"
          time="9:18 AM"
          weight="3"
          plantImage={require("@/assets/images/plant-sample.png")}
        />
        <PlantItem
          plantName="Lettuce"
          rackName="Greens Rack"
          time="9:18 AM"
          weight="3"
          plantImage={require("@/assets/images/plant-sample.png")}
        />
        <PlantItem
          plantName="Lettuce"
          rackName="Greens Rack"
          time="9:18 AM"
          weight="3"
          plantImage={require("@/assets/images/plant-sample.png")}
        />
      </View>
    </ScrollView>
  );
}
