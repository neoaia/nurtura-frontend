import { typography } from "@/assets/fonts/Text";
import PlantAddIcon from "@/assets/images/icons/plant(Add).svg";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface RadioOptionProps {
  title: string;
  description: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
  title,
  description,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-full flex justify-center items-start py-5 px-4 gap-1 border-[2px] rounded-2xl bg-white ${
        isSelected ? "border-primary" : "border-gray-200"
      }`}
    >
      {isSelected && (
        <View className="absolute top-3 right-3">
          <PlantAddIcon width={14} height={14} />
        </View>
      )}

      <Text
        style={typography["button-bold"]}
        className={isSelected ? "text-black" : "text-grayText"}
      >
        {title}
      </Text>
      <Text
        style={typography["subheader"]}
        className={isSelected ? "text-black" : "text-grayText"}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );
};
