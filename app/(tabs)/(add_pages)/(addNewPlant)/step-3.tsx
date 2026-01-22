import { typography } from "@/assets/fonts/Text";
import { BottomButton } from "@/components/shared/bottomButton";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const AddNewPlant3 = () => {
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
          Add your Plant
        </Text>

        <Text
          style={typography["subheader"]}
          className="mb-5 text-gray-700 leading-normal pl-2"
        >
          View details about the plant that you&apos;ll put in the rack.
        </Text>
      </ScrollView>

      <BottomButton title="Finish" onPress={handleNextPress} />
    </View>
  );
};

export default AddNewPlant3;
