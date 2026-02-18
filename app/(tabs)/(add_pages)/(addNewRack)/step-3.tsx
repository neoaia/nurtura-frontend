import React from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import { router } from "expo-router";

export default function AddNewRack3() {
  const onChangeText = () => {
    console.log("text changed");
  };
  const { showModal, handleConfirm, handleCancel } =
    useBackWarning(!!onChangeText);
  const handleNextPress = () => {
    router.push("/(tabs)/(add_pages)/(addNewRack)/step-4");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Add your Wi-Fi
        </Text>

        <Text
          style={typography["subheader"]}
          className="pl-2 mb-6 text-black leading-normal"
        >
          Input the credentials of your Wi-Fi network to connect your rack.
        </Text>

        <View className="flex-col gap-2">
          <TextInputField
            label="SSID/Wi-Fi Name"
            onChangeText={onChangeText}
          ></TextInputField>
          <TextInputField
            label="wi-Fi Password"
            onChangeText={onChangeText}
          ></TextInputField>
        </View>
      </ScrollView>
      <View>
        <BottomButton title="Next" onPress={handleNextPress}></BottomButton>
        <ConfirmationModal
          isVisible={showModal}
          onConfirm={handleConfirm}
          title="Go Back"
          message="All details you have entered will be restarted and gone."
          confirmText="Continue"
          cancelText="Cancel"
          onCancel={handleCancel}
        />
      </View>
    </View>
  );
}
