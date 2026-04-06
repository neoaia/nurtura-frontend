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
  metadata,
  status,
  createdAt,
}) => {
  // ── Map API type → icon ────────────────────────────────────────────────────
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

  // ── Map API type → background color ───────────────────────────────────────
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

  // ── Format createdAt → relative time ──────────────────────────────────────
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
      className={`p-3 mb-2 py-4 pr-3 pl-4 w-full flex-row items-center rounded-xl shadow-sm border min-h-[84px] ${
        isUnread ? "bg-[#F9FCF4] border-primary/30" : "bg-white border-gray-100"
      }`}
    >
      {/* ── Icon box ──────────────────────────────────────────────────────── */}
      <View
        style={getBoxStyle()}
        className="p-4 mr-4 rounded-xl items-center justify-center"
      >
        {Icon && <Icon width={20} height={20} />}
      </View>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <View className="flex-1">
        <Text
          style={typography["subheader-bold"]}
          className="text-black mb-0.5"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={typography["subheader"]}
          className="text-gray-700 leading-5"
          numberOfLines={2}
        >
          {message}
        </Text>
        <Text style={typography["subheader"]} className="text-grayText mt-1">
          {getRelativeTime(createdAt)}
        </Text>
      </View>

      {/* ── Unread dot ────────────────────────────────────────────────────── */}
      {isUnread && (
        <View className="w-2 h-2 rounded-full bg-primary ml-2 self-start mt-1" />
      )}
    </View>
  );
};

export default NotificationItem;
