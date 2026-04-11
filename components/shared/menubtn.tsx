import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

interface MenuButtonCardProps {
  type?: string;
  title: string;
  description: string;
  icon: React.FC<{ width?: number; height?: number; color?: string }>;
  iconSize?: number; // ← dagdag
  route?: string;
  onPress?: () => void;
}

export const MenuCard: React.FC<MenuButtonCardProps> = ({
  type,
  title,
  description,
  icon: Icon,
  iconSize = 22,
  route,
  onPress,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) return;
    setIsLoading(true);
    if (route) {
      router.push(route as any);
      setTimeout(() => setIsLoading(false), 500);
    } else if (onPress) {
      await onPress();
      setIsLoading(false);
    }
  };

  const colorStyle = type === "red" ? "bg-[#FFC5C5]" : "bg-[#E5EDCF]";
  const iconColor = type === "red" ? "#A72929" : "#86975A";
  const tintStyle = { tintColor: iconColor };

  return (
    <View className="bg-white rounded-2xl px-6 py-8 flex-row items-center border border-gray-100 shadow-md elevation-3 gap-3">
      <View
        className={`p-4 ${colorStyle} rounded-xl justify-center items-center`}
      >
        <Icon
          width={iconSize ?? 22}
          height={iconSize ?? 22}
          color={iconColor}
        />
      </View>

      <View className="flex-1 ml-4 pr-2">
        <Text style={typography["button-bold"]} className="text-[#333]">
          {title}
        </Text>
        <Text
          style={typography["subheader"]}
          className="text-[#919191] mt-2 leading-5"
        >
          {description}
        </Text>
      </View>

      <DebouncedTouchableOpacity
        onPress={handlePress}
        disabled={isLoading}
        className={`p-4 ${colorStyle} ${isLoading ? "opacity-50" : ""} rounded-xl justify-center items-center`}
      >
        <Image
          source={require("@/assets/images/openarrow-icon.png")}
          className="w-4 h-4"
          style={tintStyle}
          resizeMode="contain"
        />
      </DebouncedTouchableOpacity>
    </View>
  );
};
