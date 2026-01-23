import { typography } from "@/assets/fonts/Text";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface HollowButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
}

const PlantFilterBtn = ({
  onPress,
  loading,
  disabled,
  title,
}: HollowButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      className="px-4 py-3 rounded-xl bg-white border-[2px] border-primary"
      style={{ alignSelf: "flex-start" }}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#7DA544" />
      ) : (
        <Text style={typography["subheader-bold"]} className="text-primary">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PlantFilterBtn;
