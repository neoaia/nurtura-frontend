import { typography } from "@/assets/fonts/Text";
import { PlantedItemDTO } from "@/types/activity.dto";
import React from "react";
import { Image, Text, View } from "react-native";

export const PlantItem: React.FC<PlantedItemDTO> = ({
  plantName,
  rackName,
  time,
  quantity,
  // weight,
  // plantImage,
}) => {
  return (
    <View className="bg-white rounded-2xl px-4 py-6 flex-row items-center shadow-md elevation-3 my-2">
      <View className="w-20 h-20 bg-[#e9f2d9] rounded-2xl justify-center items-center">
        <Image
          // source={plantImage}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 ml-6" style={{ gap: 24 }}>
        <View style={{ gap: 4 }}>
          <Text style={typography["label-bold"]} className=" text-[#86975A]">
            {plantName}
          </Text>
          <Text style={typography["label"]} className=" text-[#919191]">
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
            <Text style={typography["label"]} className="  text-[#919191] ">
              {time}
            </Text>
          </View>

          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image
              source={require("@/assets/images/planting-icon.png")}
              className="w-[16px] h-[16px]"
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text style={typography["label"]} className="  text-[#919191] ">
              {quantity}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
