import { typography } from "@/assets/fonts/Text";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import useFetch from "@/hooks/useFetch";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const RACK_NAME_CHAR_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export default function AddNewRack4() {
  const { deviceId } = useLocalSearchParams();
  const [rackName, setRackName] = useState("");
  const [loading, setLoading] = useState(false);

  const { refetch: registerRack } = useFetch("/api/racks", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const handleNextPress = async () => {
    const nameToSend = rackName.trim() || "Nurtura";
    setLoading(true);

    try {
      const nameBase64 = Buffer.from(nameToSend).toString("base64");
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        RACK_NAME_CHAR_UUID,
        nameBase64,
      );
      console.log("Rack name sent to ESP32:", nameToSend);
    } catch (e) {
      console.log("Failed to send rack name to ESP32:", e);
      console.log("deviceID:", deviceId);
    }

    try {
      const { data, error } = await registerRack({
        body: {
          macAddress: deviceId as string,
          name: nameToSend,
        },
      });

      if (error || !data) {
        Alert.alert(
          "Error",
          error?.message || "Failed to register rack. Please try again.",
        );
        setLoading(false);
        return;
      }

      console.log("Rack registered successfully:", data);

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
    } catch (e) {
      console.error("Failed to register rack in backend:", e);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3">
          Customize your <Text className="text-primary">Nurtura Rack</Text>
        </Text>
        <Text style={typography["subheader"]} className="mb-6">
          Rename your rack based on your preference.
        </Text>
        <TextInputField
          label="Rack Name"
          onChangeText={setRackName}
          value={rackName}
          editable={!loading}
        />
      </ScrollView>
      <BottomButton
        title="Finish"
        onPress={handleNextPress}
        disabled={loading}
      />
    </View>
  );
}
