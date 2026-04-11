import { typography } from "@/assets/fonts/Text";
import RackIcon from "@/assets/images/icons/rack(Add).svg";
import { RackEventType } from "@/types/activity.dto";
import React from "react";
import { Text, View } from "react-native";

export interface RackActivityItemProps {
  id: string;
  eventType: RackEventType;
  rackName: string;
  rackNameNew?: string;
  date: string;
  time: string;
}

const EVENT_CONFIG: Record<RackEventType, { badgeColor: string }> = {
  RACK_ADDED: {
    badgeColor: "#E5EDCF",
  },
  RACK_RENAMED: {
    badgeColor: "#E5EDCF",
  },
  RACK_REMOVED: {
    badgeColor: "#FAD4D4",
  },
};

const renderContent = (props: RackActivityItemProps) => {
  const { eventType, rackName, rackNameNew, time } = props;

  if (eventType === "RACK_ADDED") {
    return (
      <Text style={typography["subheader"]} className="text-gray-700 leading-5">
        Rack{" "}
        <Text style={typography["subheader-bold"]} className="text-black">
          {rackName}
        </Text>{" "}
        has been registered.{" "}
        <Text style={typography["subheader"]} className="text-grayText">
          {time}
        </Text>
      </Text>
    );
  }

  if (eventType === "RACK_REMOVED") {
    return (
      <Text style={typography["subheader"]} className="text-gray-700 leading-5">
        Rack{" "}
        <Text style={typography["subheader-bold"]} className="text-black">
          {rackName}
        </Text>{" "}
        has been removed.{" "}
        <Text style={typography["subheader"]} className="text-grayText">
          {time}
        </Text>
      </Text>
    );
  }

  if (eventType === "RACK_RENAMED") {
    return (
      <Text style={typography["subheader"]} className="text-gray-700 leading-5">
        Rack{" "}
        <Text style={typography["subheader-bold"]} className="text-black">
          {rackName}
        </Text>{" "}
        has been renamed to{" "}
        <Text style={typography["subheader-bold"]} className="text-black">
          {rackNameNew}
        </Text>
        .{" "}
        <Text style={typography["subheader"]} className="text-grayText">
          {time}
        </Text>
      </Text>
    );
  }

  return null;
};

export const RackActivityItem: React.FC<RackActivityItemProps> = (props) => {
  const { eventType } = props;
  const config = EVENT_CONFIG[eventType];

  return (
    <View className="bg-white mb-1 py-4 w-full flex-row items-center rounded-xl min-h-[84px]">
      <View
        style={{ backgroundColor: config.badgeColor }}
        className="w-12 h-12 mr-4 rounded-xl items-center justify-center"
      >
        <RackIcon width={20} height={20} />
      </View>

      <View className="flex-1">{renderContent(props)}</View>
    </View>
  );
};

export default RackActivityItem;
