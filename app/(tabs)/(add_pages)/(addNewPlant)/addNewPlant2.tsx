import { typography } from "@/assets/fonts/Text";
import AddPlantButton from "@/components/add_plant/addPlantBtn";
import { BottomButton } from "@/components/shared/bottomButton";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const addNewPlant2 = () => {
  const handleNextPress = () => {
    router.push("/(tabs)/(home)");
  };
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text
          style={typography["h1-bold"]}
          className="text-black mb-[13px] pl-2"
        >
          Add your Plant
        </Text>

        <Text
          style={typography["subheader"]}
          className="mb-[20px] text-gray-700 leading-normal pl-2"
        >
          Choose a plant to add to your{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            Nurtura Rack
          </Text>
          .
        </Text>

        <AddPlantButton></AddPlantButton>
      </ScrollView>

      <BottomButton title="Finish" onPress={handleNextPress} />
    </View>
  );
};

export default addNewPlant2;
