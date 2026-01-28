import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { typography } from "../../assets/fonts/Text";
import { HighlightDTO } from "../../types/home.dto";

interface HighlightProps extends HighlightDTO {
  onButtonPress?: () => void;
}

const onAddRackPress = () => {
  router.push("/(tabs)/(add_pages)/(addNewRack)");
};

export const Highlight: React.FC<HighlightProps> = ({
  title,
  description,
  buttonText,
  onButtonPress,
}) => {
  return (
    <View className="mb-6">
      <View className="bg-[#a8b28e] rounded-2xl p-6">
        <Text style={typography["h2-bold"]} className="text-white mb-4">
          {title}
        </Text>
        <Text
          style={typography.label}
          className="text-white opacity-90 mb-5 max-w-[190px]"
        >
          {description}
        </Text>
        <TouchableOpacity
          onPress={onAddRackPress}
          className="bg-primary rounded-lg py-3 px-6 self-start"
          activeOpacity={0.8}
        >
          <Text style={typography["label-bold"]} className="text-white">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
