import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Modal, Text, View } from "react-native";
import { PrimaryButton } from "../shared/primaryButton";

interface InfoPopupProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

export const InfoPopup: React.FC<InfoPopupProps> = ({
  isVisible,
  title,
  message,
  confirmText = "OK",
  onConfirm,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <Text
            style={typography["h2-bold"]}
            className="text-black text-center mb-3 mt-2"
          >
            {title}
          </Text>

          <Text
            style={typography["subheader"]}
            className="text-gray-600 text-center mb-6 leading-5"
          >
            {message}
          </Text>

          <View className="flex-row gap-3 w-full mb-2">
            <View className="flex-1">
              <PrimaryButton title={confirmText} onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
