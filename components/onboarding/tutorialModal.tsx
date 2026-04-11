import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import React, { ReactNode } from "react";
import { Image, Modal, Text, View } from "react-native";

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onSkip: () => void;
  title?: string;
  subtitle?: string;
  footerText?: string;
  topOffset?: number;
  children?: ReactNode;
  characterImage?: any;
  characterPosition?: {
    bottom?: number;
    top?: number;
    left?: number;
    right?: number;
  };
}

export const OnboardingTutorialModal = ({
  visible,
  onClose,
  onSkip,
  title,
  subtitle,
  footerText = "Tap to continue",
  topOffset = 0,
  children,
  characterImage,
  characterPosition = { bottom: 0, right: 0 },
}: OnboardingModalProps) => {
  const isSvg = typeof characterImage === "function";

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/60">
        
        <DebouncedTouchableOpacity
          className="absolute inset-0"
          onPress={onClose}
          activeOpacity={1}
        />

        <View className="absolute top-12 right-6 z-50">
          <DebouncedTouchableOpacity onPress={onSkip} className="p-2">
            <View className="bg-white rounded-[16px] p-4 shadow-xl">
              <Text
                style={typography["button-bold"]}
                className="text-[#2D2D2D] text-lg"
              >
                Skip this one
              </Text>
            </View>
          </DebouncedTouchableOpacity>
        </View>

        <View className="flex-1 justify-start px-5" pointerEvents="box-none">
          <View 
            style={{ marginTop: topOffset }} 
            className="shadow-lg"
            pointerEvents="none" 
          >
            <View className="bg-white rounded-[24px] overflow-hidden">
              {children}
            </View>
          </View>

          <View className="w-full bg-white rounded-[16px] p-6 shadow-xl mt-4">
            <Text
              style={typography["button-bold"]}
              className="text-[#2D2D2D] mb-2 text-lg"
            >
              {title}
            </Text>
            <Text
              style={typography.subheader}
              className="text-base leading-6 text-[#919191] mb-6"
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
        </View>

        <View
          className="absolute"
          style={characterPosition}
          pointerEvents="none"
        >
          {isSvg ? (
            <View style={{ width: 345, height: 345 }}>
              {React.createElement(characterImage, {
                width: "100%",
                height: "100%",
              })}
            </View>
          ) : (
            <Image
              source={characterImage || require("@/assets/nuri/waving.png")}
              className="w-[345px] h-[345px]"
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Modal>
  );
};