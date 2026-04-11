import { typography } from "@/assets/fonts/Text";
import UserIcon from "@/assets/images/icons/user.svg";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import React from "react";
import { Text, View } from "react-native";

interface ProfileCardProps {
  name: string;
  username: string;
  onPress?: () => void;
}

const truncateNamePart = (part: string, maxLength = 10) => {
  if (!part) return part;
  return part.length > maxLength ? `${part.slice(0, maxLength - 1)}…` : part;
};

const formatUsername = (value: string) =>
  value
    .split(" ")
    .map((part) => truncateNamePart(part.trim()))
    .filter(Boolean)
    .join(" ");

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  username,
  onPress,
}) => {
  return (
    <DebouncedTouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View className="w-full bg-white rounded-2xl py-5 px-6 flex-row items-center shadow-md elevation-3">
        <View className="w-14 h-14 bg-[#E9F2D9] rounded-2xl justify-center items-center">
          <UserIcon width={20} height={20} color="#86975A" />
        </View>

        <View className="ml-5 flex-1">
          <Text style={typography["subheader"]} className="text-grayText">
            {name}
          </Text>
          <Text
            style={typography["button-bold"]}
            className="text-black mt-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatUsername(username)}
          </Text>
        </View>
      </View>
    </DebouncedTouchableOpacity>
  );
};
