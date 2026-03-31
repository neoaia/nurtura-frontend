import { typography } from "@/assets/fonts/Text";
import { PlantedItemDTO } from "@/types/activity.dto";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

// In-extend natin para tanggapin ang eventType AT oldPlantName
interface PlantItemProps {
  plants: PlantedItemDTO & { eventType?: string; oldPlantName?: string };
}

export const PlantItem: React.FC<PlantItemProps> = ({ plants }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    plantName, // Ito ang magsisilbing "newPlant"
    rackName,
    time,
    quantity,
    eventType,
    oldPlantName, // Idinagdag natin ito
  } = plants;

  const handlePress = async () => {
    setIsLoading(true);
    try {
      // Your logic here
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const renderSentence = () => {
    if (eventType === "PLANT_REMOVED") {
      return (
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          <Text style={typography["subheader-bold"]} className="text-black">
            {plantName}
          </Text>{" "}
          has been removed from{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {rackName}
          </Text>{" "}
          rack.{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      );
    }

    // BAGONG FORMAT PARA SA PLANT_CHANGED
    if (eventType === "PLANT_CHANGED") {
      return (
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          <Text style={typography["subheader-bold"]} className="text-black">
            {rackName}
          </Text>{" "}
          rack&apos;s plant has been changed from{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {oldPlantName || "previous crop"}
          </Text>{" "}
          to{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {plantName}
          </Text>
          .{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      );
    }

    // Default Format (PLANT_ADDED)
    return (
      <Text style={typography["subheader"]} className="text-gray-700 leading-5">
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
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      className={`p-3 bg-white mb-2 py-4 pr-3 pl-4 w-full flex-row items-center rounded-xl border border-gray-100 min-h-[84px] ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      <View className="bg-[#E5EDCF] w-12 h-12 mr-4 rounded-xl items-center justify-center">
        <Image
          // source={plantImage}
          className="w-7 h-7"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1">{renderSentence()}</View>
    </TouchableOpacity>
  );
};

export default PlantItem;
