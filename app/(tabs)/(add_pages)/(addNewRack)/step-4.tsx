import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import useFetch from "@/hooks/useFetch";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const RACK_NAME_CHAR_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export default function AddNewRack4() {
  const { deviceId, macAddress } = useLocalSearchParams();
  const [rackName, setRackName] = useState("");
  const [loading, setLoading] = useState(false);

  const { refetch: registerRack } = useFetch("/racks", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

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
        console.log("[Step4] BLE cleanup (non-fatal):", e);
      }
    };
    cleanupBLE();
  }, [deviceId]);

  const handleBack = useCallback(async () => {
    if (deviceId) {
      try {
        const isConnected = await bleManager.isDeviceConnected(
          deviceId as string,
        );
        if (isConnected) {
          await bleManager.cancelDeviceConnection(deviceId as string);
        }
      } catch (e) {
        console.log("[Step4] Back disconnect failed (non-fatal):", e);
      }
    }

    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
  }, [deviceId]);

  const { showModal, handleConfirm, handleCancel } = useBackWarning(
    true,
    handleBack,
  );

  const handleNextPress = async () => {
    const nameToSend = rackName.trim() || "Nurtura";
    setLoading(true);

    try {
      const isConnected = await bleManager.isDeviceConnected(
        deviceId as string,
      );
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
          macAddress: macAddress as string,
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
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ConfirmationModal
        isVisible={showModal}
        title="Go Back?"
        message="Going back will cancel rack customization and return you to step 1."
        confirmText="Go Back"
        cancelText="Stay"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 40 }}
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

      <BottomButton
        title="Finish"
        onPress={handleNextPress}
        disabled={loading}
      />
    </SafeAreaView>
  );
}
