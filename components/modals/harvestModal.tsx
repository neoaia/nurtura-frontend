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
  currentSeeds: number;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (selectedKey: number, seedQuantity: number) => void;
  onCancel: () => void;
}

export const HarvestModal: React.FC<HarvestModalProps> = ({
  isVisible,
  title,
  currentSeeds,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [seedQuantity, setSeedQuantity] = useState(0);

  const maxSeeds = Math.max(0, currentSeeds - 1);

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

  const handleCancel = () => {
    setSelectedKey(null);
    setSeedQuantity(0);
    onCancel();
  };

  const handleConfirm = () => {
    if (selectedKey === null) return;
    onConfirm(selectedKey, seedQuantity);
    setSelectedKey(null);
    setSeedQuantity(0);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
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
              <QuantityPicker
                title="Seeds"
                quantity={seedQuantity}
                onSubtractPress={() =>
                  setSeedQuantity((prev) => Math.max(0, prev - 1))
                }
                onAddPress={() =>
                  setSeedQuantity((prev) => Math.min(maxSeeds, prev + 1))
                }
              />
            </View>
          )}

          <View className="flex-row gap-3 w-full mb-2">
            <View className="flex-1">
              <HollowButton title={cancelText} onPress={handleCancel} />
            </View>
            <View className="flex-1">
              <PrimaryButton
                title={confirmText}
                onPress={handleConfirm}
                disabled={
                  selectedKey === null ||
                  (selectedKey === 3 && seedQuantity === 0)
                }
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
