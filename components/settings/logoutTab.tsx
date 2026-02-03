import { typography } from "@/assets/fonts/Text";
import React, { useState } from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";

interface LogOutTabProps {
  iconSource: ImageSourcePropType;
  label: string;
  onPress?: () => void | Promise<void>; 
}

export const LogOutRow: React.FC<LogOutTabProps> = ({
  iconSource,
  label,
  onPress,
}) => {
  const [isLoading, setIsLoading] = useState(false);

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
      className={`w-full flex-row items-center justify-between py-4 px-5 bg-white ${
        isLoading ? "opacity-50" : ""
      }`}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center w-full" style={{ gap: 32 }}>
        <Image source={iconSource} className="w-6 h-6" resizeMode="contain" />
        <Text style={typography['subheader']} className="text-[#D34545]">
          {isLoading ? "Logging out..." : label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};