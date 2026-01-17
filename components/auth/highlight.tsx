import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { typography } from "../../assets/fonts/Text";

interface HighlightProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonPress: () => void;
}

export const Highlight: React.FC<HighlightProps> = ({
  title,
  description,
  buttonText,
  onButtonPress,
}) => {
  return (
    <View className="mb-6">
      <View className="bg-[#a8b88f] rounded-2xl p-6">
        <Text style={typography["h1-bold"]} className="text-white mb-2">
          {title}
        </Text>
        <Text style={typography.body} className="text-white opacity-90 mb-5">
          {description}
        </Text>
        <TouchableOpacity
          onPress={onButtonPress}
          className="bg-[#7a8f5e] rounded-xl py-3 px-6 self-start"
          activeOpacity={0.8}
        >
          <Text style={typography.button} className="text-white">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
