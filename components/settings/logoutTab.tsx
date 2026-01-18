import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";

interface LogOutTabProps {
  iconSource: ImageSourcePropType;
  label: string;
  onPress?: () => void;
}

export const LogOutRow: React.FC<LogOutTabProps> = ({
  iconSource,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity
      className="w-full flex-row items-center justify-between py-4 px-5 bg-white border-b border-[#EEE]"
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center" style={{ gap: 32 }}>
        <Image source={iconSource} className="w-6 h-6" resizeMode="contain" />
        <Text style={typography['subheader']} className="  text-[#D34545]  ">{label}</Text>
      </View>
    </TouchableOpacity>
  );
};