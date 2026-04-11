import { typography } from "@/assets/fonts/Text";
import PlantIcon from "@/assets/images/icons/plants(Dashboard).svg";
import { BasePlantItemDTO } from "@/types/activity.dto";
import React from "react";
import { Text, View } from "react-native";

export const HarvestItem: React.FC<BasePlantItemDTO> = ({
  plantName,
  rackName,
  time,
}) => {
  return (
    <View className="bg-white mb-1 py-4 w-full flex-row items-center rounded-xl min-h-[84px]">
      <View className="bg-[#E5EDCF] w-12 h-12 mr-4 rounded-xl items-center justify-center">
        <PlantIcon width={20} height={20} />
      </View>

      <View className="flex-1">
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          <Text style={typography["subheader-bold"]} className="text-black">
            {plantName}
          </Text>{" "}
          harvested from{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {rackName}{" "}
          </Text>
          rack.{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default HarvestItem;
