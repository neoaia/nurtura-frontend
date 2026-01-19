import { PlantItem } from "@/components/activity/plantingItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import { useNavigation } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import React, { useLayoutEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlantCareScreen() {
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
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </View>

        {/* planting itemss */}
        <View className="px-6 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
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
    </SafeAreaView>
  );
}
