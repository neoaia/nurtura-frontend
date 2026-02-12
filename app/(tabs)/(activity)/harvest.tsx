import { HarvestItem } from "@/components/activity/harvestItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";

import { typography } from "@/assets/fonts/Text";
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

      {/* harvest card na sliding */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        className="mt-4 mb-3"
      >
        <View className="flex-row gap-4 py-3">
          <HarvestSummaryCard
            value="4.5"
            unit="Kilograms"
            label="Total harvest"
          />
          <HarvestSummaryCard
            value="4.5"
            unit="Kilograms"
            label="Total harvest"
          />
        </View>
      </ScrollView> */}

      {/* harvest itemss */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text style={typography["button-bold"]} className=" text-black">
            {formatDate(dateToday)}
          </Text>
          {/* <Ionicons name="swap-vertical" size={20} color="#86975A" /> */}
        </View>

        <HarvestItem
          plantName="Radish"
          rackName="Greens Rack"
          time="9:18 AM"
          // weight="750 g"
          // plantImage={require("@/assets/images/plant-sample.png")}
        />
        <HarvestItem
          plantName="Radish"
          rackName="Greens Rack"
          time="9:18 AM"
          // weight="750 g"
          // plantImage={require("@/assets/images/plant-sample.png")}
        />
        <HarvestItem
          plantName="Radish"
          rackName="Greens Rack"
          time="9:18 AM"
          // weight="750 g"
          // plantImage={require("@/assets/images/plant-sample.png")}
        />
        <HarvestItem
          plantName="Radish"
          rackName="Greens Rack"
          time="9:18 AM"
          // weight="750 g"
          // plantImage={require("@/assets/images/plant-sample.png")}
        />
      </View>
    </ScrollView>
  );
}
