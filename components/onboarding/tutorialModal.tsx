import { typography } from "@/assets/fonts/Text";
import React, { ReactNode } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  footerText?: string;
  topOffset?: number;
  children?: ReactNode;
  characterImage?: any;
}

export const OnboardingTutorialModal = ({
  visible,
  onClose,
  title,
  subtitle,
  footerText = "Tap anywhere to continue",
  topOffset = 0,
  children,
  characterImage = require("@/assets/nuri/waving.png"),
}: OnboardingModalProps) => {
  
  return (
  <Modal visible={visible} transparent={true} animationType="fade">
    <Pressable className="absolute inset-0 bg-black/60 flex-1" onPress={onClose}>
      
      <View className="flex-1 justify-start px-5">
        <View style={{ marginTop: topOffset }} className="shadow-lg">
           <View className="bg-white rounded-[24px] overflow-hidden">
              {children}
           </View>
        </View>

        <View className="w-full bg-white rounded-[24px] p-6 shadow-xl mt-4"> 
          <Text style={typography["button-bold"]} className="text-[#2D2D2D] mb-2 text-lg">
            {title}
          </Text>
          <Text style={typography.subheader} className="text-base text-[#919191] mb-6">
            {subtitle}
          </Text>
          <Text style={typography["body-bold"]} className="text-center text-sm text-[#BDBDBD]">
            {footerText}
          </Text>
        </View>

      </View>

      <View className="absolute bottom-0 right-0" pointerEvents="none">
        <Image source={characterImage} className="w-80 h-80" resizeMode="contain" />
      </View>

    </Pressable>
  </Modal>
);
};