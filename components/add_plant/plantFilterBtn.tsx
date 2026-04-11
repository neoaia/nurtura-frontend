import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import React, { useState } from "react";
import { ActivityIndicator, Text } from "react-native";

interface HollowButtonProps {
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  title: string;
  isActive?: boolean;
}

const PlantFilterBtn = ({
  onPress,
  loading,
  disabled,
  title,
  isActive = false,
}: HollowButtonProps) => {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const isDisabled = loading || disabled || isDebouncing;

  const handlePress = async () => {
    if (isDisabled) return;

    setIsDebouncing(true);
    try {
      await onPress();
    } finally {
      setTimeout(() => setIsDebouncing(false), 400);
    }
  };

  return (
    <DebouncedTouchableOpacity
      className={`px-4 py-3 rounded-xl border-[2px] ${
        isActive ? "bg-primary border-primary" : "bg-white border-primary"
      } ${isDisabled ? "opacity-60" : ""}`}
      style={{ alignSelf: "flex-start" }}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {loading || isDebouncing ? (
        <ActivityIndicator color={isActive ? "#FFFFFF" : "#7DA544"} />
      ) : (
        <Text
          style={typography["subheader-bold"]}
          className={isActive ? "text-white" : "text-primary"}
        >
          {title}
        </Text>
      )}
    </DebouncedTouchableOpacity>
  );
};

export default PlantFilterBtn;
