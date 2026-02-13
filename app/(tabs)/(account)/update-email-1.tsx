import React from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { EmailInput } from "@/components/auth/emailInput";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import { router } from "expo-router";

export default function UpdateEmailScreen1() {
  const { showModal, handleConfirm, handleCancel } = useBackWarning();
  const handleNextPress = () => {
    router.push("/(tabs)/(account)/update-email-2");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-6 pl-2">
          Enter your new email
        </Text>
        <EmailInput></EmailInput>
      </ScrollView>
      <View className="px-4 pb-9">
        <PrimaryButton title="Next" onPress={handleNextPress}></PrimaryButton>
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
