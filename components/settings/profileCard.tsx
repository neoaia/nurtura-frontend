import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

interface ProfileCardProps {
  name: string;
  username: string;
  iconSource: ImageSourcePropType
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, username, iconSource }) => {
  return (
    <View className="bg-white rounded-[20px] p-6 mx-4 my-4 flex-row items-center shadow-md elevation-3">
      
      <View className="w-[60px] h-[60px] bg-[#E9F2D9] rounded-full justify-center items-center">
        <Image 
          source={iconSource}
          className="w-8 h-8"
          style={{ tintColor: "#86975A" }}
          resizeMode="contain"
        />
      </View>

      <View className="ml-5">
        <Text className="text-[14px] text-[#919191] font-medium">
          {name}
        </Text>
        <Text className="text-[18px] font-bold text-[#333] mt-1">
          {username}
        </Text>
      </View>
    </View>
  );
};