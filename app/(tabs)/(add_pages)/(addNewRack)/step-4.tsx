import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import useFetch from "@/hooks/useFetch";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const RACK_NAME_CHAR_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const RESET_CHAR_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

export default function AddNewRack4() {
  const { deviceId, macAddress } = useLocalSearchParams();
  const [rackName, setRackName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const { refetch: registerRack } = useFetch("/racks", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  // BLE is already disconnected by onWiFiConnected in the app/firmware
  // but we kept the cleanup just in case
  useEffect(() => {
    const cleanupBLE = async () => {
      if (!deviceId) return;
      try {
        const isConnected = await bleManager.isDeviceConnected(
          deviceId as string,
        );
        if (isConnected) {
          await bleManager.cancelDeviceConnection(deviceId as string);
          console.log("[Step4] Cleaned up stray BLE connection");
        }
      } catch (e) {
        // Ignore cleanup errors
        console.log("[Step4] BLE cleanup (non-fatal):", e);
      }
    };
    cleanupBLE();
  }, [deviceId]);

  // Handle back button - show confirmation
  const handleBackPress = () => {
    setShowBackConfirm(true);
  };

  // Confirmed back - attempt to reset ESP32 if still connected, then go to step-1
  const handleBackConfirmed = async () => {
    setShowBackConfirm(false);
    setLoading(true);
    console.log("[Step4] User confirmed back - attempting to reset ESP32");

    try {
      // Try to reconnect and send reset command (best-effort)
      // The BLE connection may already be dropped, which is fine
      try {
        const isConnected = await bleManager.isDeviceConnected(
          deviceId as string,
        );

        if (!isConnected) {
          console.log("[Step4] BLE already disconnected (expected)");
        } else {
          console.log("[Step4] BLE still connected, sending reset command...");
          try {
            await bleManager.writeCharacteristicWithoutResponseForDevice(
              deviceId as string,
              SERVICE_UUID,
              RESET_CHAR_UUID,
              Buffer.from("FACTORY_RESET").toString("base64"),
            );
            console.log("[Step4] Reset command sent to ESP32");
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (e) {
            console.log("[Step4] Reset write failed, continuing anyway:", e);
          }

          // Try final disconnect
          try {
            await bleManager.cancelDeviceConnection(deviceId as string);
            console.log("[Step4] BLE disconnected");
          } catch (e) {
            console.log("[Step4] Final BLE disconnect failed (non-fatal):", e);
          }
        }
      } catch (e) {
        console.log("[Step4] BLE connection check failed (non-fatal):", e);
      }
    } catch (e) {
      console.log("[Step4] Error during reset attempt:", e);
    }

    setLoading(false);
    // Always navigate back to step-1 regardless of reset success
    console.log("[Step4] Navigating back to step-1");
    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
  };

  const handleNextPress = async () => {
    const nameToSend = rackName.trim() || "Nurtura";
    setLoading(true);

    // Best-effort: send name to ESP32 if still connected
    try {
      const isConnected = await bleManager.isDeviceConnected(deviceId as string);
      if (isConnected) {
        await bleManager.writeCharacteristicWithoutResponseForDevice(
          deviceId as string,
          SERVICE_UUID,
          RACK_NAME_CHAR_UUID,
          Buffer.from(nameToSend).toString("base64"),
        );
        console.log("[Step4] Rack name sent to ESP32:", nameToSend);
      }
    } catch (e) {
      console.log("[Step4] Rack name write failed (non-fatal):", e);
    }

    try {
      const { data, error } = await registerRack({
        body: {
          macAddress: macAddress as string,  // ← use real ESP32 MAC, not BLE deviceId
          name: nameToSend,
        },
      });

      if (error || !data) {
        Alert.alert(
          "Error",
          error?.message || "Failed to register rack. Please try again.",
        );

        return;
      }

      console.log("[Step4] Rack registered successfully:", data);

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
      console.error("[Step4] Failed to register rack:", e);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ConfirmationModal
        isVisible={showBackConfirm}
        title="Go Back?"
        message="Going back will reset your rack to BLE provisioning mode:

• WiFi connection will be cleared
• MQTT will disconnect
• Bluetooth will restart
• The rack will be ready to pair again

You'll need to run the setup process again."
        confirmText="Yes, Reset & Go Back"
        cancelText="Continue"
        onConfirm={handleBackConfirmed}
        onCancel={() => setShowBackConfirm(false)}
      />

      <ScrollView
        className="flex-1 px-6 py-24"
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-2">
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

      <View className="pb-6">
        <BottomButton
          title="Finish"
          onPress={handleNextPress}
          disabled={loading}
        />
      </View>
    </View>
  );
}
