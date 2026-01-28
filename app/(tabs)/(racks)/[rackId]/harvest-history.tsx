import HarvestHistoryItem from "@/components/racks/harvestHistoryItem";
import TotalHarvestCard from "@/components/racks/totalHarvestCard";
import React from "react";
import { ScrollView, View } from "react-native";

const harvestHistory = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="bg-white">
      <View className="px-4 py-4 bg-white">
        <TotalHarvestCard
          harvest={{ totalFrequency: 150, sinceDate: "July 23, 2025" }}
        />

        <View className="mt-6">
          <HarvestHistoryItem
            harvestHistory={{
              id: "1",
              plantName: "Lettuce",
              time: "3h ago",
            }}
          />
          <HarvestHistoryItem
            harvestHistory={{
              id: "2",
              plantName: "Lettuce",
              time: "5h ago",
            }}
          />
          <HarvestHistoryItem
            harvestHistory={{
              id: "3",
              plantName: "Lettuce",
              time: "1d ago",
            }}
          />
          <HarvestHistoryItem
            harvestHistory={{
              id: "4",
              plantName: "Lettuce",
              time: "2d ago",
            }}
          />
          <HarvestHistoryItem
            harvestHistory={{
              id: "5",
              plantName: "Lettuce",
              time: "3d ago",
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default harvestHistory;
