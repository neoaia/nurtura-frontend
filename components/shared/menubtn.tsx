import { typography } from "@/assets/fonts/Text";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuButtonCardProps {
  type?: string;
  title: string;
  description: string;
  iconSource: ImageSourcePropType;
  route?: string;
  onPress?: () => void;
}

export const MenuCard: React.FC<MenuButtonCardProps> = ({
  type,
  title,
  description,
  iconSource,
  route,
  onPress,
}) => {
  const handlePress = () => {
    if (route) {
      router.push(route as any);
    } else if (onPress) {
      onPress();
    }
  };

  const colorStyle = type === "red" ? "bg-[#FFC5C5]" : "bg-[#E5EDCF]";
  const tintStyle = { tintColor: type === "red" ? "#A72929" : "#86975A" };

  return (
    <View className="bg-white rounded-2xl px-6 py-8 flex-row items-center border border-gray-100 shadow-md elevation-3 gap-3">
      <View
        className={`p-4 ${colorStyle} rounded-xl justify-center items-center`}
      >
        <Image
          source={iconSource}
          className="w-6 h-6"
          style={tintStyle}
          resizeMode="contain"
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

      <TouchableOpacity
        onPress={handlePress}
        className={`p-4 ${colorStyle} rounded-xl justify-center items-center`}
      >
        <Image
          source={require("@/assets/images/openarrow-icon.png")}
          className="w-4 h-4"
          style={tintStyle}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};
