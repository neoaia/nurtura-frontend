import { typography } from "@/assets/fonts/Text";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface HollowButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
  isActive?: boolean; // Add this prop
}

const PlantFilterBtn = ({
  onPress,
  loading,
  disabled,
  title,
  isActive = false, // Default to false
}: HollowButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      className={`px-4 py-3 rounded-xl border-[2px] ${
        isActive ? "bg-primary border-primary" : "bg-white border-primary"
      }`}
      style={{ alignSelf: "flex-start" }}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={isActive ? "#FFFFFF" : "#7DA544"} />
      ) : (
        <Text
          style={typography["subheader-bold"]}
          className={isActive ? "text-white" : "text-primary"}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PlantFilterBtn;
