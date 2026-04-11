import { typography } from "@/assets/fonts/Text";
import DateIcon from "@/assets/images/icons/date.svg";
import RackIcon from "@/assets/images/icons/rack(Add).svg";
import React from "react";
import { Modal, Text, View } from "react-native";
import { PrimaryButton } from "../shared/primaryButton";
import SmallDescription from "../shared/smallDescription";

interface RackExistsModalProps {
  isVisible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  rackName?: string;
  dateRemoved?: string;
}

export const RackExistsModal: React.FC<RackExistsModalProps> = ({
  isVisible,
  title,
  message,
  confirmText = "Confirm",
  onConfirm,
  rackName,
  dateRemoved,
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
            className="text-black text-center mb-3 my-3"
          >
            {title}
          </Text>

          <Text
            style={typography["subheader"]}
            className="text-black text-center mb-4 leading-5 px-3"
          >
            {message}
          </Text>

          <View className="flex-col gap-6 w-full mt-4 mb-9 mx-2">
            <SmallDescription
              label="Rack Name"
              value={rackName || ""}
              Icon={RackIcon}
            ></SmallDescription>
            <SmallDescription
              label="Date Removed"
              value={dateRemoved || ""}
              Icon={DateIcon}
            ></SmallDescription>
          </View>

          <Text
            style={typography["subheader"]}
            className="text-grayText text-center mb-5 leading-5 px-2"
          >
            You can rename this rack later.
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
