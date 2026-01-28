import React from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { TextInputField } from "@/components/shared/textInputField";
import { router } from "expo-router";

export default function AddNewRack3() {
  const handleNextPress = () => {
    router.push("/(tabs)/(add_pages)/(addNewRack)/step-4");
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
      <View className="px-4 pb-9">
        <PrimaryButton title="Next" onPress={handleNextPress}></PrimaryButton>
      </View>
    </View>
  );
}
