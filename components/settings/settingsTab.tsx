import { typography } from "@/assets/fonts/Text";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingsTabProps {
  iconSource: ImageSourcePropType;
  label: string;
  route: string;
}

export const SettingsRow: React.FC<SettingsTabProps> = ({
  iconSource,
  label,
  route,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = () => {
    if (isLoading) return;

    setIsLoading(true);
    router.push(route as any);

    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <TouchableOpacity
      className={`w-full flex-row items-center justify-between py-2 px-5 bg-white ${
        isLoading ? "opacity-50" : ""
      }`}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center" style={{ gap: 24 }}>
        <Image source={iconSource} className="w-5 h-5" resizeMode="contain" />
        <Text style={typography["subheader"]} className="text-black">
          {label}
        </Text>
      </View>

      <Image
        source={require("@/assets/images/openarrow-icon.png")}
        className="w-3 h-3"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};
