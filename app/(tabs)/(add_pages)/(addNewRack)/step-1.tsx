import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { router } from "expo-router";

export default function AddNewRack1() {
  const handleNextPress = () => {
    router.push("/(tabs)/(add_pages)/(addNewRack)/step-2");
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
          Connect to your{" "}
          <Text style={typography["h1-bold"]} className="text-primary">
            Nurtura Rack
          </Text>
        </Text>

        <Text
          style={typography["subheader"]}
          className="pl-2 mb-6 text-black leading-normal"
        >
          Open your{" "}
          <Text className="text-black" style={typography["subheader-bold"]}>
            Nurtura Rack
          </Text>{" "}
          and connect to its bluetooth connection.
          <Text className="text-primary font-bold"></Text>
        </Text>
      </ScrollView>
      <View className="px-4 pb-9">
        <PrimaryButton title="Next" onPress={handleNextPress}></PrimaryButton>
      </View>
    </View>
  );
}
