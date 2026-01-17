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

export const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  plantName,
  rackName,
  location,
  time,
  duration,
}) => {
  const config = activityCategory[type];

  return (
    <View className="bg-white rounded-2xl p-3 mb-2 shadow-md elevation-3">
      <View className="flex-row items-center">
        <View className="m-3 flex-1 gap-5">
          <View>
            <Text className="text-sm text-black">
              {config.actionText}
              <Text style={{ color: config.plantcolor }} className="font-bold">
                {" "}
                {plantName}
              </Text>
            </Text>

            <Text className="text-sm mt-1 text-grayText">
              {rackName} at {location}
            </Text>
          </View>

          <View className="flex-row items-center" style={{ gap: 86 }}>
            <View className="flex-row" style={{ gap: 6 }}>
              <Image
                source={config.time}
                className="w-4 h-4"
                resizeMode="contain"
              />
              <Text className="text-[#919191] text-sm ml-1">{time}</Text>
            </View>

            <View className="flex-row" style={{ gap: 6 }}>
              <Image
                source={config.icon}
                className="w-4 h-4"
                resizeMode="contain"
              />
              <Text className="text-[#919191] text-sm ml-1">{duration}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
