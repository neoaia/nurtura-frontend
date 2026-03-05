import { typography } from "@/assets/fonts/Text";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileCardProps {
  name: string;
  username: string;
  iconSource: ImageSourcePropType;
  onPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  username,
  iconSource,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View className="w-full bg-white rounded-2xl py-5 px-6 flex-row items-center shadow-md elevation-3">
        <View className="w-14 h-14 bg-[#E9F2D9] rounded-full justify-center items-center">
          <Image
            source={iconSource}
            className="w-6 h-6"
            style={{ tintColor: "#86975A" }}
            resizeMode="contain"
          />
        </View>

        <View className="ml-5">
          <Text style={typography["subheader"]} className="  text-grayText  ">
            {name}
          </Text>
          <Text style={typography["button-bold"]} className="  text-black mt-1">
            {username}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
