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
      className="w-full flex-row items-center justify-between py-4 px-5 bg-white"
      onPress={() => router.push(route as any)}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center" style={{ gap: 32 }}>
        <Image source={iconSource} className="w-[22px] h-[22px]" resizeMode="contain" />
        <Text className="text-[14px] text-[#333] font-normal">{label}</Text>
      </View>

      <Image
        source={require("@/assets/images/openarrow-icon.png")}
        className="w-[14px] h-[14px]"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};