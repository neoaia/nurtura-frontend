import { typography } from "@/assets/fonts/Text";
import { BasePlantItemDTO } from "@/types/activity.dto";
import React from "react";
import { Image, Text, View } from "react-native";

export const HarvestItem: React.FC<BasePlantItemDTO> = ({
  plantName,
  rackName,
  time,
}) => {
  return (
    <View className=" bg-white mb-1 py-4 w-full flex-row items-center rounded-xl min-h-[84px]">
      {/* Badge / Icon Container */}
      <View className="bg-[#E5EDCF] w-12 h-12 mr-4 rounded-xl items-center justify-center">
        {/* Placeholder pa rin yung Image, pwede mong ipalit ang harvest SVG dito later */}
        <Image
          // source={plantImage}
          className="w-7 h-7"
          resizeMode="contain"
        />
      </View>

      {/* Content Container (Sentence Format) */}
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
