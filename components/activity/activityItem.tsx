import React from "react";
import { Image, Text, View } from "react-native";

interface ActivityItemProps {
  type: "water" | "light";
  plantName: string;
  rackName: string;
  location: string;
  time: string;
  duration: string;
}

const activityCategory = {
  water: {
    icon: require("@/assets/images/watered-icon.png"),
    time: require("@/assets/images/watered-time-icon.png"),
    plantcolor: "#2596be",
    actionText: "Watered the",
  },
  light: {
    icon: require("@/assets/images/light-icon.png"),
    time: require("@/assets/images/light-time-icon.png"),
    plantcolor: "#d6c125",
    actionText: "Provided light to",
  },
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ type, plantName, rackName, location, time, duration }) => {
  const config = activityCategory[type];

  return (
    <View className="bg-white rounded-[14px] p-[14px] mb-2 shadow-md elevation-3">
      <View className="flex-row items-center">
        <View className="m-[10px] flex-1" style={{ gap: 25 }}>
          
          <View>
            <Text className="text-[14px] font-medium text-[#333]">
              {config.actionText} 
              <Text style={{ color: config.plantcolor }} className="font-bold"> {plantName}</Text>
            </Text>
            
            <Text className="text-[14px] font-medium mt-1 text-[#919191]">
              {rackName} at {location}
            </Text>
          </View>

          <View className="flex-row items-center mt-1" style={{ gap: 86 }}>
            <View className="flex-row" style={{ gap: 6 }}>
              <Image source={config.time} className="w-4 h-4" resizeMode="contain" />
              <Text className="text-[#919191] text-[12px] ml-1">{time}</Text>
            </View>

            <View className="flex-row" style={{ gap: 6 }}>
              <Image source={config.icon} className="w-4 h-4" resizeMode="contain" />
              <Text className="text-[#919191] text-[12px] ml-1">{duration}</Text>
            </View>
          </View>

        </View>
      </View>
    </View>
  );
};