import { typography } from "@/assets/fonts/Text";
import { NotificationItemDTO } from "@/types/home.dto";
import React from "react";
import { Text, View } from "react-native";

import DisconnectedIcon from "../../assets/images/icons/disconnected.svg";
import InfoIcon from "../../assets/images/icons/info.svg";
import LightIcon from "../../assets/images/icons/light(Activity).svg";
import HarvestIcon from "../../assets/images/icons/plant(Add).svg";
import WarningIcon from "../../assets/images/icons/warning(notif).svg";
import WaterIcon from "../../assets/images/icons/watered(Activity).svg";

export const NotificationItem: React.FC<NotificationItemDTO> = ({
  type,
  plantName,
  location,
  value,
  time,
  rackName,
  metric,
  component,
}) => {
  const getIconByType = () => {
    if (type === "water") return WaterIcon;
    if (type === "light") return LightIcon;
    if (type === "harvest") return HarvestIcon;
    if (type === "environment") return WarningIcon;
    if (type === "sensor") return DisconnectedIcon;
    if (type === "info") return InfoIcon;
    return null;
  };

  const Icon = getIconByType();

  const getBoxStyle = () => {
    switch (type) {
      case "water":
        return { backgroundColor: "#CFE6ED" };
      case "light":
        return { backgroundColor: "#F1EEA2" };
      case "harvest":
        return { backgroundColor: "#E5EDCF" };
      case "sensor":
        return { backgroundColor: "#EBB2F6" };
      case "environment":
        return { backgroundColor: "#E9A2A2" };
      case "info":
        return { backgroundColor: "#E5E5E5" };
      default:
        return { backgroundColor: "#D9D9D9" };
    }
  };

  const getActionText = () => {
    switch (type) {
      case "water":
        return "has been watered automatically by";
      case "light":
        return "has been lit automatically by";
      case "harvest":
        return "has been harvested";
      default:
        return "notification";
    }
  };

  const getUnit = () => {
    switch (type) {
      case "water":
        return " mL";
      case "light":
        return "%";
      case "harvest":
        return " ";
      case "environment":
        return metric === "temperature" ? "°C" : "%";
      default:
        return "";
    }
  };

  const renderContent = () => {
    if (type === "water" || type === "light" || type === "harvest") {
      return (
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          The{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {plantName}
          </Text>{" "}
          on{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {location}
          </Text>{" "}
          Garden {getActionText()}{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {value}
            {getUnit()}
          </Text>
          .{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      );
    }

    if (type === "environment") {
      return (
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          The{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {rackName}
          </Text>{" "}
          has reached a {metric} of{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {value}
            {getUnit()}
          </Text>
          .{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      );
    }

    if (type === "sensor") {
      return (
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          The{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {component}
          </Text>{" "}
          on{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {rackName}
          </Text>{" "}
          has been disconnected.{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      );
    }

    if (type === "info") {
      return (
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          The{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            {rackName}
          </Text>{" "}
          has been disconnected.{" "}
          <Text style={typography["subheader"]} className="text-grayText">
            {time}
          </Text>
        </Text>
      );
    }

    return null;
  };

  return (
    <View className="p-3 bg-white mb-2 py-4 pr-3 pl-4 w-full flex-row items-center rounded-xl shadow-sm border border-gray-100 min-h-[84px]">
      <View
        style={getBoxStyle()}
        className="p-4 mr-4 rounded-xl items-center justify-center"
      >
        {Icon && <Icon width={20} height={20} />}
      </View>

      <View className="flex-1">{renderContent()}</View>
    </View>
  );
};

export default NotificationItem;
