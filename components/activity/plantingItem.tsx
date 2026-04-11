import { typography } from "@/assets/fonts/Text";
import SeedIcon from "@/assets/images/icons/seed.svg";
import { PlantedItemDTO } from "@/types/activity.dto";
import React, { useState } from "react";
import { Text, View } from "react-native";

interface PlantItemProps {
  plants: PlantedItemDTO & { eventType?: string; oldPlantName?: string };
}

export const PlantItem: React.FC<PlantItemProps> = ({ plants }) => {
  const [isLoading] = useState(false);
  const { plantName, rackName, time, quantity, eventType, oldPlantName } =
    plants;

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
    <View
      className={`bg-white w-full flex-row items-center rounded-xl min-h-[84px] ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      <View className="bg-[#E5EDCF] w-12 h-12 mr-4 rounded-xl items-center justify-center">
        <SeedIcon width={20} height={20} />
      </View>

      <View className="flex-1">{renderSentence()}</View>
    </View>
  );
};

export default PlantItem;
