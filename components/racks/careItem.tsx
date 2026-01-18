import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Text, View } from "react-native";

interface CareItemProps {
  type: "water" | "light";
  plantName: string;
  value: string;
  time: string;
}

const CareItem = ({ type, plantName, value, time }: CareItemProps) => {
  const getActionText = () => {
    switch (type) {
      case "water":
        return "has been watered automatically by";
      case "light":
        return "light level adjusted to";
      default:
        return "notification for";
    }
  };

  return (
    <View className="p-3 bg-white mb-2 py-4 pr-3 pl-4 w-full flex-row justify-start items-center rounded-xl shadow-sm border border-gray-100 min-h-[84px]">
      <View
        style={{ backgroundColor: type === "water" ? "#CFE6ED" : "#F1EEA2" }}
        className={`p-6 mr-4 rounded-xl items-center justify-center`}
      ></View>
      <View className="flex-1">
        <Text
          style={typography["subheader"]}
          className=" text-gray-700 leading-5"
        >
          The{" "}
          <Text style={typography["subheader-bold"]} className=" text-black">
            {plantName}
          </Text>{" "}
          {getActionText()}{" "}
          <Text style={typography["subheader-bold"]} className=" text-black">
            {value}
          </Text>
          . <Text className="text-gray-400">{time}</Text>
        </Text>
      </View>
    </View>
  );
};

export default CareItem;
