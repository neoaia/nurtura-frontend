import React from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { EmailInput } from "@/components/auth/emailInput";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { router } from "expo-router";

export default function UpdateEmailScreen1() {
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
      </View>
    </View>
  );
}
