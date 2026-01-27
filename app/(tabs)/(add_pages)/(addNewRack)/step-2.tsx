import React from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { router } from "expo-router";

export default function AddNewRack2() {
  const handleNextPress = () => {
    router.push("/(tabs)/(add_pages)/(addNewRack)/step-3");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Verify your connection
        </Text>

        <Text
          style={typography["subheader"]}
          className="pl-2 mb-6 text-black leading-normal"
        >
          Scan the QR code of your{" "}
          <Text className="text-black" style={typography["subheader-bold"]}>
            Nurtura Rack
          </Text>{" "}
          and verify your connection.
          <Text className="text-primary font-bold"></Text>
        </Text>
      </ScrollView>
      <View className="px-4 pb-9">
        <PrimaryButton
          title="Open Camera"
          onPress={handleNextPress}
        ></PrimaryButton>
      </View>
    </View>
  );
}
