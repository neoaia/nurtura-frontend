import { typography } from "@/assets/fonts/Text";
import { ActivityDTO } from "@/types/activity.dto";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ActivityItemProps extends ActivityDTO {}

const activityCategory = {
  water: {
    icon: require("@/assets/images/watered-icon.png"),
    time: require("@/assets/images/watered-time-icon.png"),
    plantcolor: "#2596be",
    actionText: "Watered the",
    bgColor: "#e3f2fd", // Soft blue for water
  },
  light: {
    icon: require("@/assets/images/light-icon.png"),
    time: require("@/assets/images/light-time-icon.png"),
    plantcolor: "#d6c125",
    actionText: "Provided light to",
    bgColor: "#fffde7", // Soft yellow for light
  },
};

export const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  plantName,
  rackName,
  time,
  amount,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const config = activityCategory[type];

  const handlePress = async () => {
    setIsLoading(true);
    try {
      // Logic here
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
      {/* Image Container - Using the dynamic bgColor */}
      <View 
        className="w-20 h-20 rounded-2xl justify-center items-center" 
        style={{ backgroundColor: config.bgColor }}
      >
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
            style={[typography["label-bold"], { color: config.plantcolor }]}
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
              source={config.time}
              className="w-4 h-4"
              resizeMode="contain"
            />
            <Text style={typography["label"]} className="text-[#919191]">
              {time}
            </Text>
          </View>

          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image
              source={config.icon}
              className="w-4 h-4"
              resizeMode="contain"
            />
            <Text style={typography["label"]} className="text-[#919191]">
              {amount} {type === "water" ? "mL" : ""}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ActivityItem;