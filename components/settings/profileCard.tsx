import { typography } from "@/assets/fonts/Text";
import UserIcon from "@/assets/images/icons/user.svg";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ProfileCardProps {
  name: string;
  username: string;
  onPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  username,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View className="w-full bg-white rounded-2xl py-5 px-6 flex-row items-center shadow-md elevation-3">
        <View className="w-14 h-14 bg-[#E9F2D9] rounded-2xl justify-center items-center">
          <UserIcon width={20} height={20} color="#86975A" />
        </View>

        <View className="ml-5">
          <Text style={typography["subheader"]} className="text-grayText">
            {name}
          </Text>
          <Text style={typography["button-bold"]} className="text-black mt-1">
            {username}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
