import { typography } from "@/assets/fonts/Text";
import AddPlantButton from "@/components/add_plant/addPlantBtn";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const addNewPlant2 = () => {
  const handleNextPress = () => {
    router.push("/(tabs)/(home)");
  };
  return (
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-full justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
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

        <TouchableOpacity
          className="mt-[20px] w-full bg-primary rounded-2xl py-4"
          onPress={handleNextPress}
        >
          <Text style={typography["button"]} className="text-white text-center">
            Go to Main Page (Temporary)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default addNewPlant2;
