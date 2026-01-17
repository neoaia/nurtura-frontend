import React from "react";
import { Text, View } from "react-native";

interface HarvestHistoryItemProps {
  value: string;
  plantName: string;
  time: string;
}

const HarvestHistoryItem = ({
  value,
  plantName,
  time,
}: HarvestHistoryItemProps) => {
  return (
    <View className="p-3 bg-white mb-2 py-4 pr-3 pl-4 w-full flex-row justify-start items-center rounded-xl shadow-sm border border-gray-100 min-h-[84px]">
      <View
        style={{ backgroundColor: "#E5EDCF" }}
        className="p-6 mr-4 rounded-xl items-center justify-center"
      />
      <View className="flex-1">
        <Text className="text-base text-gray-700 leading-5">
          You have harvested{" "}
          <Text className="font-bold text-black">{value} g</Text> of{" "}
          <Text className="font-bold text-black">{plantName}</Text> from your
          rack. <Text className="text-gray-400">{time}</Text>
        </Text>
      </View>
    </View>
  );
};

export default HarvestHistoryItem;
