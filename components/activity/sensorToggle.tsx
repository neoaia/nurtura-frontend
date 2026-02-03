import React, { useState } from "react";
import { Image, TouchableOpacity } from "react-native";

type ButtonStatus = "defaultLight" | "defaultWater" | "clickedLight" | "clickedWater";

interface ActivityButtonProps {
  status: ButtonStatus;
  onPress?: () => void | Promise<void>; 
}

const BUTTON_CONFIG = {
  defaultWater: {
    icon: require("@/assets/images/watered-icon-gray.png"),
    bgColor: "#F0F0F0",
    borderColor: "transparent",
  },
  clickedWater: {
    icon: require("@/assets/images/watered-icon.png"),
    bgColor: "#CFE6ED",
    borderColor: "#619AAC",
  },
  defaultLight: {
    icon: require("@/assets/images/light-icon-gray.png"),
    bgColor: "#F0F0F0",
    borderColor: "transparent",
  },
  clickedLight: {
    icon: require("@/assets/images/light-icon-dark.png"),
    bgColor: "#EAE793",
    borderColor: "#99941A",
  },
};

export const ActivityButton: React.FC<ActivityButtonProps> = ({ status, onPress }) => {
  const [isLoading, setIsLoading] = useState(false); 
  const config = BUTTON_CONFIG[status];

  const handlePress = async () => {
    if (isLoading || !onPress) return;

    setIsLoading(true);
    try {
      await onPress();
    } finally {
      
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <TouchableOpacity 
      className={`w-[160px] h-[35px] rounded-[8px] border-[2.5px] justify-center items-center m-2 ${
        isLoading ? "opacity-50" : ""
      }`}
      style={{ backgroundColor: config.bgColor, borderColor: config.borderColor }}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Image source={config.icon} className="w-4 h-4" resizeMode="contain" />
    </TouchableOpacity>
  );
};