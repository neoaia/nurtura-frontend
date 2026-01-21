import { typography } from "@/assets/fonts/Text";
import { BottomButton } from "@/components/shared/bottomButton";
import Dropdown from "@/components/shared/dropdown";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const AddNewPlant1 = () => {
  const handleNextPress = () => {
    router.push("/(tabs)/(add_pages)/(addNewPlant)/addNewPlant2");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Select a{" "}
          <Text style={typography["h1-bold"]} className="text-primary">
            Nurtura Rack
          </Text>
        </Text>

        <Text
          style={typography["subheader"]}
          className="mb-5 text-gray-700 leading-normal pl-2"
        >
          Choose which rack you want to add your plant to.
        </Text>

        <Dropdown />
      </ScrollView>

      <BottomButton title="Next" onPress={handleNextPress} />
    </View>
  );
};

export default AddNewPlant1;
