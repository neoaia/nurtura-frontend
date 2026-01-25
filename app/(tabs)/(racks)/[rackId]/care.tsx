import CareItem from "@/components/racks/careItem";
import React from "react";
import { ScrollView, View } from "react-native";

const care = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="bg-white">
      <View className="px-4 py-4 bg-white">
        <CareItem
          activity={{
            id: "1",
            type: "water",
            plantName: "Lettuce",
            value: "200 mL",
            time: "2h ago",
          }}
        />
        <CareItem
          activity={{
            id: "2",
            type: "light",
            plantName: "Tomato",
            value: "80%",
            time: "5m ago",
          }}
        />
      </View>
    </ScrollView>
  );
};

export default care;
