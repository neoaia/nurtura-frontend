import { typography } from "@/assets/fonts/Text";
import React, { useState } from "react";
import { Modal, Text, View } from "react-native";
import { HollowButton } from "../shared/hollowButton";
import { PrimaryButton } from "../shared/primaryButton";
import { QuantityPicker } from "../shared/quantityPicker";
import { RadioOption } from "../shared/radioOption";

interface HarvestModalProps {
  isVisible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (selectedKey: number | null) => void;
  onCancel: () => void;
}

export const HarvestModal: React.FC<HarvestModalProps> = ({
  isVisible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  const harvestOptions = [
    {
      key: 1,
      title: "Harvest Leaves",
      description: "I will only harvest yields and keep all seeds.",
    },
    {
      key: 2,
      title: "Harvest All",
      description: "I will harvest both yields and all seeds.",
    },
    {
      key: 3,
      title: "Take Some Seeds",
      description: "I will harvest yields and remove some seeds.",
    },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-4 w-full max-w-sm">
          <Text
            style={typography["h2-bold"]}
            className="text-black text-center mb-5 mt-2"
          >
            {title}
          </Text>

          {harvestOptions.map((option) => (
            <View
              key={option.key}
              className="flex flex-col justify-center items-center gap-3 w-full mb-2"
            >
              <RadioOption
                title={option.title}
                description={option.description}
                isSelected={selectedKey === option.key}
                onPress={() => setSelectedKey(option.key)}
              />
            </View>
          ))}
          {selectedKey === 3 && (
            <View className="w-full mb-8">
              <QuantityPicker title="Seeds" quantity={0} />
            </View>
          )}

          <View className="flex-row gap-3 w-full mb-2">
            <View className="flex-1">
              <HollowButton title={cancelText} onPress={onCancel} />
            </View>
            <View className="flex-1">
              <PrimaryButton
                title={confirmText}
                onPress={() => onConfirm(selectedKey)}
                disabled={selectedKey === null}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
