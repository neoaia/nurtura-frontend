import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Modal, Text, View } from "react-native";
import { PrimaryButton } from "../shared/primaryButton";

interface InfoModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isVisible,
  title,
  message,
  confirmText = "Confirm",
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
        <View className="bg-white rounded-2xl p-4 w-full max-w-sm">
          <Text
            style={typography["button-bold"]}
            className="text-black text-center mb-3 mt-2"
          >
            {title}
          </Text>

          <Text
            style={typography["subheader"]}
            className="text-black text-center mb-3 leading-5 px-2"
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
