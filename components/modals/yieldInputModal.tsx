import { typography } from "@/assets/fonts/Text";
import React, { useEffect, useState } from "react";
import { Modal, Text, View } from "react-native";
import { HollowButton } from "../shared/hollowButton";
import { NumberInputField } from "../shared/numberInputField";
import { PrimaryButton } from "../shared/primaryButton";

interface YieldInputModalProps {
  isVisible: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (yieldValue: number) => void;
  onCancel: () => void;
}

export const YieldInputModal: React.FC<YieldInputModalProps> = ({
  isVisible,
  title,
  confirmText = "Submit",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const [yieldValue, setYieldValue] = useState<number>(0);

  useEffect(() => {
    if (!isVisible) {
      setYieldValue(0);
    }
  }, [isVisible]);

  const handleConfirm = () => {
    onConfirm(yieldValue);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <Text
            style={typography["h2-bold"]}
            className="text-black text-center mb-3 mt-2"
          >
            {title}
          </Text>

          <NumberInputField
            label="Yield (grams)"
            value={yieldValue}
            onChangeText={(text) => setYieldValue(Number(text))}
            placeholder="0"
          />

          <View className="flex-row gap-3 w-full mb-2 mt-4">
            <View className="flex-1">
              <HollowButton title={cancelText} onPress={onCancel} />
            </View>
            <View className="flex-1">
              <PrimaryButton title={confirmText} onPress={handleConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
