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
  type: string;
  title: string;
  description: string;
  iconSource: ImageSourcePropType;
  route?: string;
}

export const MenuCard: React.FC<MenuButtonCardProps> = ({
  type,
  title,
  description,
  iconSource,
  route,
}) => {
  return (
    <View className="bg-white rounded-2xl px-6 py-8 flex-row items-center border border-gray-100 shadow-md elevation-3 gap-3">
      <View
        className={`p-4 ${type === "green" ? "bg-[#E5EDCF]" : "bg-[#FFC5C5]"} rounded-xl justify-center items-center`}
      >
        <Image
          source={iconSource}
          className="w-6 h-6"
          style={{ tintColor: type === "green" ? "#86975A" : "#A72929" }}
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 ml-4 pr-2">
        <Text style={typography["button-bold"]} className="  text-[#333]">
          {title}
        </Text>
        <Text
          style={typography["subheader"]}
          className=" text-[#919191] mt-2 leading-5"
        >
          {description}
        </Text>
      </View>

      {route ? (
        <TouchableOpacity
          onPress={() => router.push(route as any)}
          className={`p-4 ${type === "green" ? "bg-[#E5EDCF]" : "bg-[#FFC5C5]"} rounded-xl justify-center items-center`}
        >
          <Image
            source={require("@/assets/images/openarrow-icon.png")}
            className="w-4 h-4"
            style={{ tintColor: type === "green" ? "#86975A" : "#A72929" }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <View
          className={`p-4 ${type === "green" ? "bg-[#E5EDCF]" : "bg-[#FFC5C5]"} rounded-xl justify-center items-center`}
        >
          <Image
            source={require("@/assets/images/openarrow-icon.png")}
            className="w-4 h-4"
            style={{ tintColor: type === "green" ? "#86975A" : "#A72929" }}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};
