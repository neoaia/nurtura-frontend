import HarvestHistoryItem from "@/components/racks/harvestHistoryItem";
import TotalHarvestCard from "@/components/racks/totalHarvestCard";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const harvestHistory = () => {
  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 bg-white">
          <TotalHarvestCard totalGrams={150} sinceDate="July 23, 2025" />

          <View className="mt-6">
            <HarvestHistoryItem value="150" plantName="Lettuce" time="3h ago" />
            <HarvestHistoryItem value="200" plantName="Lettuce" time="5h ago" />
            <HarvestHistoryItem value="250" plantName="Lettuce" time="1d ago" />
            <HarvestHistoryItem value="300" plantName="Lettuce" time="2d ago" />
            <HarvestHistoryItem value="350" plantName="Lettuce" time="3d ago" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default harvestHistory;
