import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface AddRackButtonProps {
  onPress?: () => void;
  label?: string;
}

const PlusIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke="#4B5563"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const AddRackButton: React.FC<AddRackButtonProps> = ({
  onPress,
  label = "Add a Nurtura Rack",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      className="w-full bg-[#EDEDED] active:bg-gray-300 rounded-2xl p-11 sm:p-8"
    >
      <View className="flex-row items-center justify-center gap-4 sm:gap-4">
        <View className="px-2 py-2 sm:w-12 sm:h-12 bg-[#D9D9D9] rounded-xl items-center justify-center">
          <PlusIcon />
        </View>
        <Text className="text-lg sm:text-xl font-semibold text-black">
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AddRackButton;
