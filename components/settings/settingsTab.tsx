import { router } from "expo-router";
import React from "react";
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
  return (
    <TouchableOpacity
      className="w-full flex-row items-center justify-between py-3 px-5 bg-white"
      onPress={() => router.push(route as any)}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center" style={{ gap: 32 }}>
        <Image source={iconSource} className="w-5 h-5" resizeMode="contain" />
        <Text className="text-sm text-black">{label}</Text>
      </View>

      <Image
        source={require("@/assets/images/openarrow-icon.png")}
        className="w-3 h-3"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};