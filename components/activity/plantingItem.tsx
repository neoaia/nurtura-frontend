import { typography } from "@/assets/fonts/Text";
import { PlantedItemDTO } from "@/types/activity.dto";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface PlantItemProps {
  plants: PlantedItemDTO;
}

export const PlantItem: React.FC<PlantItemProps> = ({ plants }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    plantName,
    rackName,
    time,
    quantity,
    // weight,
    // plantImage,
  } = plants;

  const handlePress = async () => {
    setIsLoading(true);
    try {
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      className={`bg-white rounded-2xl px-4 py-6 flex-row items-center shadow-md elevation-3 my-2 ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      {/* Image Container */}
      <View className="w-20 h-20 bg-[#e9f2d9] rounded-2xl justify-center items-center">
        <Image
          // source={plantImage}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* Content Container */}
      <View className="flex-1 ml-6" style={{ gap: 24 }}>
        <View style={{ gap: 4 }}>
          <Text 
            style={typography["label-bold"]} 
            className="text-[#86975A]"
            numberOfLines={1}
          >
            {plantName}
          </Text>
          <Text 
            style={typography["label"]} 
            className="text-[#919191]"
            numberOfLines={1}
          >
            at {rackName}
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row mr-8" style={{ gap: 56 }}>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image
              source={require("@/assets/images/plant-time-icon.png")}
              className="w-4 h-4"
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text style={typography["label"]} className="text-[#919191]">
              {time}
            </Text>
          </View>

          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image
              source={require("@/assets/images/planting-icon.png")}
              className="w-4 h-4"
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text style={typography["label"]} className="text-[#919191]">
              {quantity}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PlantItem;