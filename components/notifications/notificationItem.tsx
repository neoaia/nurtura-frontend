import React from "react";
import { Text, View } from "react-native";

interface NotificationItemProps {
  type: "water" | "light" | "harvest" | "sensor" | "environment";
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ type }) => {
  const getLabel = () => {
    switch (type) {
      case "water":
        return "Needs Watering";
      case "light":
        return "Light Level Alert";
      case "harvest":
        return "Ready for Harvest";
      case "sensor":
        return "Sensor Notification";
      case "environment":
        return "Environment Alert";
      default:
        return "Unknown Notification";
    }
  };

  const getBoxColor = () => {
    switch (type) {
      case "water":
        return "bg-[#CFE6ED]";
      case "light":
        return "bg-[#F1EEA2]";
      case "harvest":
        return "bg-[#E5EDCF]";
      case "sensor":
        return "bg-[#EBB2F6]";
      case "environment":
        return "bg-[#E9A2A2]";
      default:
        return "bg-[#D9D9D9]";
    }
  };

  return (
    <View className="p-3 bg-white mb-2 py-4 pr-3 pl-7 w-full flex-row justify-start items-center">
      <View className={`py-6 px-6 ${getBoxColor()} mr-7 rounded-lg`}></View>
      <View className="flex-1">
        <Text className="text-black text-base font-semibold">{getLabel()}</Text>
      </View>
    </View>
  );
};
export default NotificationItem;