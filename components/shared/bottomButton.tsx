// components/shared/BottomButton.tsx
import { typography } from "@/assets/fonts/Text";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
}

export const BottomButton: React.FC<BottomButtonProps> = ({
  title,
  onPress,
  disabled = false,
}) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    try {
      await onPress();
    } finally {
      setIsLoading(false);
    }
  };

  const isInteractionDisabled = disabled || isLoading;

  return (
    <View
      style={{
        paddingBottom: insets.bottom || 40,
        paddingTop: 20,
        paddingHorizontal: 16,
        backgroundColor: "#FAFAFA",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 24,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={isInteractionDisabled}
        activeOpacity={0.7}
        className={`w-full py-6 rounded-xl ${
          isInteractionDisabled ? "bg-gray-300" : "bg-primary"
        } ${isLoading ? "opacity-70" : ""}`}
      >
        <Text
          style={typography["button-bold"]}
          className={`text-center ${
            isInteractionDisabled ? "text-gray-500" : "text-white"
          }`}
        >
          {isLoading ? "Loading..." : title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};