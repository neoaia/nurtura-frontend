import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface AddPlantButtonProps {
  onPress?: () => void | Promise<void>;
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

const AddPlantButton: React.FC<AddPlantButtonProps> = ({
  onPress,
  label = "Add a Plant",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading || !onPress) return;

    setIsLoading(true);
    try {
      await onPress();
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <DebouncedTouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      className={`w-full bg-[#EDEDED] active:bg-gray-300 rounded-2xl p-9 sm:p-8 ${
        isLoading ? "opacity-60" : ""
      }`}
    >
      <View className="flex-row items-center justify-center gap-4 sm:gap-4">
        <View className="px-2 py-2 sm:w-12 sm:h-12 bg-[#D9D9D9] rounded-xl items-center justify-center">
          <PlusIcon />
        </View>
        <Text style={typography["button-bold"]} className="text-black">
          {isLoading ? "Loading..." : label}
        </Text>
      </View>
    </DebouncedTouchableOpacity>
  );
};

export default AddPlantButton;
