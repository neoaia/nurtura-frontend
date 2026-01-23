// components/shared/BottomButton.tsx
import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const BottomButton: React.FC<BottomButtonProps> = ({
  title,
  onPress,
  disabled = false,
}) => {
  const insets = useSafeAreaInsets();

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
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        className={`w-full py-6 rounded-xl ${
          disabled ? "bg-gray-300" : "bg-primary"
        }`}
      >
        <Text
          style={typography["button-bold"]}
          className={`text-center ${disabled ? "text-gray-500" : "text-white"}`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
