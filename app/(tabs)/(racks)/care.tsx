import AddPlantButton from "@/components/add_plant/addPlantBtn";
import PlantDetailHeader from "@/components/add_plant/plantDetailHeader";
import SelectedRackCard from "@/components/add_plant/selectedRackCard";
import CareItem from "@/components/racks/careItem";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const care = () => {
  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 bg-white">
          <CareItem
            type="water"
            plantName="Lettuce"
            value="200 mL"
            time="2h ago"
          />
          <CareItem type="light" plantName="Tomato" value="80%" time="5m ago" />

          <AddPlantButton />
          <PlantDetailHeader plantName="Test" plantType="Grabe" />
          <SelectedRackCard rackName="My Rack" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default care;
