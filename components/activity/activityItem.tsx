import { typography } from "@/assets/fonts/Text";
import { ActivityDTO } from "@/types/activity.dto";
import React from "react";
import { Image, Text, View } from "react-native";

interface ActivityItemProps extends ActivityDTO {}

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
  time,
  amount,
}) => {
  const config = activityCategory[type];

  return (
    <View className="bg-white rounded-2xl p-3 mb-2 shadow-md elevation-3">
      <View className="flex-row items-center">
        <View className="m-3 flex-1 gap-5">
          <View>
            <Text
              style={[
                typography["subheader-bold"],
                { color: config.plantcolor },
              ]}
            >
              {plantName}
            </Text>

            <Text
              style={typography["subheader"]}
              className="mt-1 text-grayText"
            >
              at {rackName}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
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
                {amount} mL
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
