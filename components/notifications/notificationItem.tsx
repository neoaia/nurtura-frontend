import { typography } from "@/assets/fonts/Text";
import { NotificationItemDTO } from "@/types/notification.dto";
import React from "react";
import { Text, View } from "react-native";

import DisconnectedIcon from "../../assets/images/icons/disconnected.svg";
import InfoIcon from "../../assets/images/icons/info.svg";
import HarvestIcon from "../../assets/images/icons/plant(Add).svg";
import WarningIcon from "../../assets/images/icons/warning(notif).svg";
import WaterIcon from "../../assets/images/icons/watered(Activity).svg";

export const NotificationItem: React.FC<NotificationItemDTO> = ({
  type,
  title,
  message,
  status,
  createdAt,
}) => {
  const getIconByType = () => {
    switch (type) {
      case "ALERT":
        return WaterIcon;
      case "WARNING":
        return WarningIcon;
      case "SUCCESS":
        return HarvestIcon;
      case "SYSTEM":
        return DisconnectedIcon;
      case "INFO":
        return InfoIcon;
      default:
        return InfoIcon;
    }
  };

  const getBoxStyle = () => {
    switch (type) {
      case "ALERT":
        return { backgroundColor: "#CFE6ED" };
      case "WARNING":
        return { backgroundColor: "#E9A2A2" };
      case "SUCCESS":
        return { backgroundColor: "#E5EDCF" };
      case "SYSTEM":
        return { backgroundColor: "#EBB2F6" };
      case "INFO":
        return { backgroundColor: "#E5E5E5" };
      default:
        return { backgroundColor: "#D9D9D9" };
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const Icon = getIconByType();
  const isUnread = status === "UNREAD";

  return (
    <View
      // Idinagdag ang 'px-4' class dito
      className={`px-4 w-full flex-row items-center min-h-[84px] ${
        isUnread ? "bg-[#f0f5e7]" : "bg-white"
      }`}
    >
      {/* ── Icon box ──────────────────────────────────────────────────────── */}
      <View
        style={getBoxStyle()}
        className="w-12 h-12 mr-4 rounded-xl items-center justify-center"
      >
        {Icon && <Icon width={16} height={16} />}
      </View>
      {/* ── Content — sentence format ─────────────────────────────────────── */}
      <View className="flex-1">
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
        >
          <Text style={typography["subheader-bold"]} className="text-black">
            {title}
          </Text>{" "}
          {"- "}
          {message}
          {". "}
          <Text style={typography["subheader"]} className="text-grayText">
            {getRelativeTime(createdAt)}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default NotificationItem;
