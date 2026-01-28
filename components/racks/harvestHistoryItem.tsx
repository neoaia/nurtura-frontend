import { typography } from "@/assets/fonts/Text";
import { HarvestHistoryDTO } from "@/types/rack.dto";
import React from "react";
import { Text, View } from "react-native";

interface HarvestHistoryItemProps {
  harvestHistory: HarvestHistoryDTO;
}

const HarvestHistoryItem: React.FC<HarvestHistoryItemProps> = ({
  harvestHistory,
}) => {
  const { plantName, time } = harvestHistory;

  return (
    <View className="p-3 bg-white mb-2 py-4 pr-3 pl-4 w-full flex-row justify-start items-center rounded-xl shadow-sm border border-gray-100 min-h-[84px]">
      <View
        style={{ backgroundColor: "#E5EDCF" }}
        className="p-6 mr-4 rounded-xl items-center justify-center"
      />
      <View className="flex-1">
        <Text
          style={typography["subheader"]}
          className=" text-gray-700 leading-5"
        >
          You have harvested{" "}
          <Text style={typography["subheader-bold"]} className=" text-black">
            {plantName}
          </Text>{" "}
          from your rack.{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default HarvestHistoryItem;
