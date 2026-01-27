import React from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { PasswordInput } from "@/components/auth/passwordInput";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { router } from "expo-router";

export default function ChangePassword2() {
  const handleNextPress = () => {
    router.dismissAll();
    router.push("/(tabs)/(home)");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Set new password
        </Text>
        <Text
          style={typography["subheader"]}
          className="pl-2 mb-6 text-black leading-normal"
        >
          Enter a secure password to protect your account.
          <Text className="text-primary font-bold"></Text>
        </Text>
        <View className="flex-col gap-2">
          <PasswordInput label="Password" value=""></PasswordInput>
          <PasswordInput label="Confirm Password" value=""></PasswordInput>
        </View>
      </ScrollView>
      <View className="px-4 pb-9">
        <PrimaryButton title="Finish" onPress={handleNextPress}></PrimaryButton>
      </View>
    </View>
  );
}
