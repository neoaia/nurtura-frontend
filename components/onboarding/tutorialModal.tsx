import { typography } from "@/assets/fonts/Text";
import React, { ReactNode } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  footerText?: string;
  position?: "top" | "center" | "bottom";
  children?: ReactNode; // This allows you to add any component inside
  characterImage?: any; // Allows you to change the Nuri pose
}

export const OnboardingTutorialModal = ({
  visible,
  onClose,
  title,
  subtitle,
  footerText = "Tap anywhere to continue",
  position = "center",
  children,
  characterImage = require("@/assets//nuri/waving.png"),
}: OnboardingModalProps) => {
  const positionClasses = {
    top: "justify-start pt-20",
    center: "justify-center",
    bottom: "justify-end pb-40",
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <Pressable
        className="absolute inset-0 flex-1 bg-black/60"
        onPress={onClose}
      >
        {/* 1. Skip Button
        <View className="absolute top-14 right-6">
          <View className="bg-white px-5 py-3 rounded-2xl">
            <Text style={typography["button-bold"]} className="text-[#4A4A4A]">Skip this one</Text>
          </View>
        </View>
        */}
        {/* 2. THE CUSTOM COMPONENT (The "Highlighted" part) */}
        <View className="px-8 mt-40">{children}</View>

        {/* 3. The Modal Card & Character Container */}
        <View className={`flex-1 px-8 ${positionClasses[position]}`}>
          <View className="w-full bg-white rounded-[24px] p-8 shadow-xl">
            <Text
              style={typography["button-bold"]}
              className="text-left text-[#2D2D2D] mb-2 text-lg"
            >
              {title}
            </Text>
            <Text
              style={typography.subheader}
              className="text-left text-base leading-6 text-[#919191] mb-10"
            >
              {subtitle}
            </Text>
            <Text
              style={typography["body-bold"]}
              className="text-center text-sm text-[#BDBDBD]"
            >
              {footerText}
            </Text>
          </View>

          {/* Character */}
          <View className="absolute bottom-0 right-0" pointerEvents="none">
            <Image
              source={characterImage}
              className="w-72 h-72"
              resizeMode="contain"
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};
