import React from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { TextInputField } from "@/components/shared/textInputField";
import { router } from "expo-router";

export default function AddNewRack3() {
  const handleNextPress = () => {
    router.dismissAll();
    router.push({
      pathname: "/(tabs)/(add_pages)/(addNewPlant)/successScreen",
      params: {
        type: "other",
        title: "E-mail updated!",
        subtitle: "You can now proceed back to making your account safe.",
        finishTitle: "Finish"
      }
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
      <View className="px-4 pb-9">
        <PrimaryButton title="Finish" onPress={handleNextPress}></PrimaryButton>
      </View>
    </View>
  );
}
