import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { ActivityDTO } from "@/types/activity.dto";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

interface ActivityItemProps extends ActivityDTO {
  duration?: string; // Para sa light activity
}

const activityCategory = {
  water: {
    // icon: WaterIcon,
    // time: TimestampIcon,
    plantcolor: "#2596be",
    actionText: "Watered the",
    bgColor: "#e3f2fd",
  },
  light: {
    // icon: LightIcon,
    // time: TimestampIcon,
    plantcolor: "#d6c125",
    actionText: "Provided light to",
    bgColor: "#fffde7",
  },
};

export const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  plantName,
  rackName,
  time,
  amount, // Para sa water (mL)
  duration, // Para sa light (e.g., "8 hours")
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const config = activityCategory[type];

  const handlePress = async () => {
    setIsLoading(true);
    try {
      // Your logic here
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <DebouncedTouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      className={` bg-white mb-1 py-4 w-full flex-row items-center rounded-xl min-h-[84px] ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      {/* Badge / Icon Container */}
      <View
        className="w-12 h-12 mr-4 rounded-xl items-center justify-center"
        style={{ backgroundColor: config.bgColor }}
      >
        <Image
          // source={plantImage}
          className="w-7 h-7"
          resizeMode="contain"
        />
      </View>

      {/* Content Container (Sentence Format) */}
      <View className="flex-1">
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          {config.actionText}{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {plantName}
          </Text>{" "}
          at{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {rackName}
          </Text>
          {/* Eksaktong lalabas dito ang " with {amount}mL" o " for {duration}" depende sa type */}
          {type === "water" && amount ? ` with ${amount}mL` : ""}
          {type === "light" && duration ? ` for ${duration}` : ""}.{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      </View>
    </DebouncedTouchableOpacity>
  );
};

export default ActivityItem;
