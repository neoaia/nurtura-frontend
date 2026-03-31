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
    // plantImage,
  } = plants;

  const handlePress = async () => {
    setIsLoading(true);
    try {
      // Your logic here
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      // Kinopya ang wrapper classes mula sa RackActivityItem
      className={`bg-white mb-1 py-4 w-full flex-row items-center rounded-xl min-h-[84px] ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      {/* Badge / Icon Container */}
      <View className="bg-[#E5EDCF] w-12 h-12 mr-4 rounded-xl items-center justify-center">
        {/* Pwede mong ipalit ang SVG icon dito kung meron kang plant icon, 
            pero iniwan ko muna ang Image placeholder mo */}
        <Image
          // source={plantImage}
          className="w-7 h-7"
          resizeMode="contain"
        />
      </View>

      {/* Content Container (Sentence Format gaya ng RackActivityItem) */}
      <View className="flex-1">
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          <Text style={typography["subheader-bold"]} className="text-black">
            {quantity} {plantName}
          </Text>{" "}
          planted at{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {rackName}
          </Text>
          .{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PlantItem;
