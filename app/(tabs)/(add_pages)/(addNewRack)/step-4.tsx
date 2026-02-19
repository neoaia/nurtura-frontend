import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { router, useLocalSearchParams } from "expo-router";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const RACK_NAME_CHAR_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export default function AddNewRack4() {
  const { deviceId } = useLocalSearchParams();
  const [rackName, setRackName] = useState("");

  const handleNextPress = async () => {
    const nameToSend = rackName || "Nurtura";
    console.log(`Saving Rack: ${nameToSend} for Device: ${deviceId}`);

    // Write rack name to ESP32 before navigating
    try {
      const nameBase64 = Buffer.from(nameToSend).toString("base64");
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        RACK_NAME_CHAR_UUID,
        nameBase64
      );
      console.log("Rack name sent to ESP32:", nameToSend);
    } catch (e) {
      console.log("Failed to send rack name to ESP32:", e);
    }

    router.push({
      pathname: "/(tabs)/(add_pages)/(addNewRack)/successScreen",
      params: {
        type: "rack",
        title: "Rack added successfully!",
        subtitle: `Your rack "${nameToSend}" is now active.`,
        finishTitle: "Finish",
        deviceId: deviceId,
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