import React from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import { router } from "expo-router";

export default function AddNewRack3() {
  const { showModal, handleConfirm, handleCancel } = useBackWarning();
  const handleNextPress = () => {
    router.dismissAll();
    router.push({
      pathname: "/(tabs)/(add_pages)/(addNewRack)/successScreen",
      params: {
        type: "rack",
        title: "Rack added successfully!",
        subtitle: "You can now proceed back to making your account safe.",
        finishTitle: "Finish",
        addAnotherTitle: "Add another Rack",
      },
    });
  };

  const onChangeText = () => {
    console.log("text changed");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Customize your{" "}
          <Text style={typography["h1-bold"]} className="text-primary">
            Nurtura Rack
          </Text>
        </Text>

        <Text
          style={typography["subheader"]}
          className="pl-2 mb-6 text-black leading-normal"
        >
          Rename your rack based on your personal preference.
        </Text>

        <View className="flex-col gap-2">
          <TextInputField
            label="Rack Name"
            onChangeText={onChangeText}
          ></TextInputField>
        </View>
      </ScrollView>
      <View>
        <BottomButton title="Finish" onPress={handleNextPress}></BottomButton>
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
