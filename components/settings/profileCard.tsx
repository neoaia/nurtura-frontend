import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

interface ProfileCardProps {
  name: string;
  username: string;
  iconSource: ImageSourcePropType
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, username, iconSource }) => {
  return (
    <View className=" w-full bg-white rounded-2xl py-5 px-6 mx-4 my-4 flex-row items-center shadow-md elevation-3">
      
      <View className="w-12 h-12 bg-[#E9F2D9] rounded-full justify-center items-center">
        <Image 
          source={iconSource}
          className="w-5 h-5"
          style={{ tintColor: "#86975A" }}
          resizeMode="contain"
        />
      </View>

      <View className="ml-5">
        <Text className="text-sm text-grayText font-medium">
          {name}
        </Text>
        <Text className="text-base font-bold text-black mt-1">
          {username}
        </Text>
      </View>
    </View>
  );
};