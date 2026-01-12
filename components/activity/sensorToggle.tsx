import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

type ButtonStatus = "defaultLight" | "defaultWater" | "clickedLight" | "clickedWater";

interface ActivityButtonProps {
  status: ButtonStatus;
  onPress?: () => void;
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
  const config = BUTTON_CONFIG[status];

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: config.bgColor, borderColor: config.borderColor }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={config.icon} style={styles.icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 160,
    height: 35,
    borderRadius: 8,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
});