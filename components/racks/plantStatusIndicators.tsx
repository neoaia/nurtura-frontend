import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Text, View } from "react-native";

interface plantStatusIndicators {
  type: "temperature" | "humidity" | "soil-moisture";
  value: string | number;
  label?: string;
}

const getCardConfig = (type: plantStatusIndicators["type"]) => {
  switch (type) {
    case "temperature":
      return {
        bgColor: "bg-[#FFBE96]",
        textColor: "text-[#C4733B]",
        label: "Temp (C)",
      };
    case "humidity":
      return {
        bgColor: "bg-[#CFE6ED]",
        textColor: "text-[#619AAC]",
        label: "Humidity",
      };
    case "soil-moisture":
      return {
        bgColor: "bg-[#FFE6B2]",
        textColor: "text-[#C29D50]",
        label: "Soil Moisture",
      };
  }
};

const PlantStatusIndicators: React.FC<plantStatusIndicators> = ({
  type,
  value,
  label,
}) => {
  const config = getCardConfig(type);
  const displayLabel = label || config.label;

  return (
    <View className="items-center bg-white rounded-xl py-4 px-3 shadow-sm border border-gray-100 flex-1 mx-1">
      <View
        className={`w-10 h-10 ${config.bgColor} rounded-lg items-center justify-center mb-2`}
      ></View>

      <Text
        style={typography["label"]}
        className={` ${config.textColor} mb-0.5 text-center`}
      >
        {displayLabel}
      </Text>

      <Text
        style={typography["button-bold"]}
        className={` ${config.textColor}`}
      >
        {value}
      </Text>
    </View>
  );
};

export default PlantStatusIndicators;
