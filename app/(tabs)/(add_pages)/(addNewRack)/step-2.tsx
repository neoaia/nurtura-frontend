import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { BottomButton } from "@/components/shared/bottomButton";
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
        <View className="mb-9 ml-3">
          <Image
            source={require("@/assets/images/add-new-rack/plant-rack.png")}
            className="w-40 h-40"
          ></Image>
        </View>

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
      <View>
        <BottomButton
          title="Open Camera"
          onPress={handleNextPress}
        ></BottomButton>
      </View>
    </View>
  );
}
