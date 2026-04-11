import { typography } from "@/assets/fonts/Text";
import { ActivityDTO } from "@/types/activity.dto";
import React, { useState } from "react";
import { Text, View } from "react-native";
import LightActivityIcon from "../../assets/images/icons/home/light_activity/activity_main.svg";
import WaterActivityIcon from "../../assets/images/icons/home/water_activity/activity_main.svg";

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
  {
    bgColor: string;
    Icon: React.FC<{ width: number; height: number }>;
    renderText: (props: ActivityItemProps) => React.ReactNode;
  }
> = {
  WATERING_START: {
    bgColor: "#CFE6ED",
    Icon: WaterActivityIcon,
    renderText: ({ plantName, rackName }) => (
      <>
        Started watering the <B>{plantName}</B> at <B>{rackName}</B>.
      </>
    ),
  },
  WATERING_STOP: {
    bgColor: "#CFE6ED",
    Icon: WaterActivityIcon,
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
    bgColor: "#F1EEA2",
    Icon: LightActivityIcon,
    renderText: ({ plantName, rackName }) => (
      <>
        Started the light for <B>{plantName}</B> at <B>{rackName}</B>.
      </>
    ),
  },
  LIGHT_OFF: {
    bgColor: "#F1EEA2",
    Icon: LightActivityIcon,
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
  const [isLoading] = useState(false);
  const config = eventConfig[eventType];

  return (
    <View
      className={`bg-white mb-1 py-4 w-full flex-row items-center rounded-xl min-h-[84px] ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      <View
        className="w-12 h-12 mr-4 rounded-xl items-center justify-center"
        style={{ backgroundColor: config.bgColor }}
      >
        <config.Icon width={20} height={20} />
      </View>

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
    </View>
  );
};

export default ActivityItem;
