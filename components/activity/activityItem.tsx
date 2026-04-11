import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { ActivityDTO } from "@/types/activity.dto";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

interface ActivityItemProps extends ActivityDTO {
  duration?: string;
}

const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={typography["subheader-bold"]} className="text-black">
    {children}
  </Text>
);

const eventConfig: Record<
  ActivityDTO["eventType"],
  { bgColor: string; renderText: (props: ActivityItemProps) => React.ReactNode }
> = {
  WATERING_START: {
    bgColor: "#e3f2fd",
    renderText: ({ plantName, rackName }) => (
      <>
        Started watering the <B>{plantName}</B> at <B>{rackName}</B>.
      </>
    ),
  },
  WATERING_STOP: {
    bgColor: "#e3f2fd",
    renderText: ({ plantName, rackName, amount }) => (
      <>
        Watered the <B>{plantName}</B> at <B>{rackName}</B>
        {amount ? (
          <>
            {" "}
            with <B>{amount}mL</B>
          </>
        ) : (
          ""
        )}
        .
      </>
    ),
  },
  LIGHT_ON: {
    bgColor: "#fffde7",
    renderText: ({ plantName, rackName }) => (
      <>
        Started the light for <B>{plantName}</B> at <B>{rackName}</B>.
      </>
    ),
  },
  LIGHT_OFF: {
    bgColor: "#fffde7",
    renderText: ({ plantName, rackName, duration }) => (
      <>
        Turned off the light for <B>{plantName}</B> at <B>{rackName}</B>
        {duration ? (
          <>
            {" "}
            for <B>{duration}</B>
          </>
        ) : (
          ""
        )}
        .
      </>
    ),
  },
};

export const ActivityItem: React.FC<ActivityItemProps> = (props) => {
  const { eventType, time } = props;
  const [isLoading, setIsLoading] = useState(false);
  const config = eventConfig[eventType];

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
      className={`bg-white mb-1 py-4 w-full flex-row items-center rounded-xl min-h-[84px] ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      {/* Badge / Icon Container */}
      <View
        className="w-12 h-12 mr-4 rounded-xl items-center justify-center"
        style={{ backgroundColor: config.bgColor }}
      >
        <Image className="w-7 h-7" resizeMode="contain" />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          {config.renderText(props)}{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      </View>
    </DebouncedTouchableOpacity>
  );
};

export default ActivityItem;
