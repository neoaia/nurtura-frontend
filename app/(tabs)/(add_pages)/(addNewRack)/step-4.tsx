import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { typography } from "@/assets/fonts/Text";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { router, useLocalSearchParams } from "expo-router";

export default function AddNewRack4() {
  const { deviceId } = useLocalSearchParams();
  const [rackName, setRackName] = useState("");

  const handleNextPress = () => {
    console.log(`Saving Rack: ${rackName} for Device: ${deviceId}`);
    router.dismissAll();
    router.push({
      pathname: "/(tabs)/(add_pages)/(addNewRack)/successScreen",
      params: {
        type: "rack",
        title: "Rack added successfully!",
        subtitle: `Your rack "${rackName || 'Nurtura'}" is now active.`,
        finishTitle: "Finish",
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 34 }}>
        <Text style={typography["h1-bold"]} className="text-black mb-3">
          Customize your <Text className="text-primary">Nurtura Rack</Text>
        </Text>
        <Text style={typography["subheader"]} className="mb-6">Rename your rack based on your preference.</Text>
        <TextInputField label="Rack Name" onChangeText={setRackName} value={rackName} />
      </ScrollView>
      <BottomButton title="Finish" onPress={handleNextPress} />
    </View>
  );
}