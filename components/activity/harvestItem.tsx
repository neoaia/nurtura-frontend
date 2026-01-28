import { typography } from "@/assets/fonts/Text";
import { BasePlantItemDTO } from "@/types/activity.dto";
import React from "react";
import { Image, Text, View } from "react-native";

export const HarvestItem: React.FC<BasePlantItemDTO> = ({
  plantName,
  rackName,
  time,
  // weight,
  // plantImage,
}) => {
  return (
    <View className="bg-white rounded-2xl px-4 py-6 flex-row items-center shadow-md border-gray-100 elevation-3 my-2">
      <View className=" bg-[#e9f2d9] rounded-2xl justify-center items-center">
        <Image
          // source={plantImage}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      <View className="ml-5 flex-1 gap-5">
        <View>
          <Text style={typography["subheader-bold"]} className="  text-primary">
            {plantName}
          </Text>
          <Text style={typography["subheader"]} className="  text-[#919191]">
            at {rackName}
          </Text>
        </View>

        <View className="flex-row mr-8" style={{ gap: 56 }}>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image
              source={require("@/assets/images/plant-time-icon.png")}
              className="w-[16px] h-[16px]"
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text style={typography["label"]} className=" text-grayText">
              {time}
            </Text>
          </View>

          {/* <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image
              source={require("@/assets/images/harvest-icon.png")}
              className="w-[16px] h-[16px]"
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text style={typography["label"]} className=" text-grayText">
              {weight}
            </Text>
          </View> */}
        </View>
      </View>
    </View>
  );
};
