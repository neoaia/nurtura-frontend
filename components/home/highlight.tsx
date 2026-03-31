import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { typography } from "../../assets/fonts/Text";
import { HighlightDTO } from "../../types/home.dto";

interface HighlightProps extends HighlightDTO {
  onButtonPress?: () => void;
}

const onAddRackPress = () => {
  router.push("/(tabs)/(add_pages)/(addNewRack)");
};

const OVERFLOW_AMOUNT = 20; // how many px the head pokes above the card

export const Highlight: React.FC<HighlightProps> = ({
  title,
  description,
  buttonText,
  onButtonPress,
}) => {
  return (
    <View className="mb-6">
      {/* Outer wrapper: gives room above for the image to bleed into */}
      <View style={{ paddingTop: OVERFLOW_AMOUNT, overflow: "hidden" }}>
        <View className="bg-primary rounded-2xl p-6 overflow-visible">
          <View className="flex-row items-end justify-between">
            {/* Text content */}
            <View className="flex-1 pr-4">
              <Text style={typography["h2-bold"]} className="text-white mb-2">
                {title}
              </Text>
              <Text
                style={typography.label}
                className="text-[#E5EDCF] opacity-90 mb-7 max-w-[190px]"
              >
                {description}
              </Text>
              <TouchableOpacity
                onPress={onAddRackPress}
                className="bg-white rounded-lg py-3 px-6 self-start"
                activeOpacity={0.8}
              >
                <Text
                  style={typography["button-bold"]}
                  className="text-primary"
                >
                  {buttonText}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Character image — head bleeds into paddingTop zone */}
            <View style={{ position: "absolute", bottom: 0, right: 0 }}>
              <Image
                source={require("@/assets/nuri/proud.png")}
                style={{
                  width: 355,
                  height: 355,
                  bottom: -185,
                  left: 110,
                }}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
