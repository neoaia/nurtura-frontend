import { router } from "expo-router";
import React from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";

interface MenuButtonCardProps {
  title: string;
  description: string;
  iconSource: ImageSourcePropType;
  route: string;
}

export const MenuCard: React.FC<MenuButtonCardProps> = ({ title, description, iconSource, route }) => {
  return (
    /* 1. Changed outer wrapper to View so the whole card isn't clickable */
    <View 
      className="bg-white rounded-[12px] px-6 py-8 flex-row items-center shadow-md elevation-3 gap-3"
    >
      <View className="p-4 bg-[#E5EDCF] rounded-[12px] justify-center items-center">
        <Image 
          source={iconSource} 
          className="w-6 h-6"
          style={{ tintColor: "#86975A" }}
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 ml-4 pr-2">
        <Text className="text-base font-bold text-[#333]">
          {title}
        </Text>
        <Text className="text-sm text-[#919191] mt-2 leading-5">
          {description}
        </Text>
      </View>

      {/* 2. Now only the Arrow is the TouchableOpacity! */}
      <TouchableOpacity 
        activeOpacity={0.6}
        onPress={() => router.push(route as any)}
        className="w-[47px] h-[47px] bg-[#E5EDCF] rounded-[8px] justify-center items-center"
      >
        <Image 
          source={require("@/assets/images/openarrow-icon.png")}
          className="w-4 h-4"
          style={{ tintColor: "#86975A" }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};