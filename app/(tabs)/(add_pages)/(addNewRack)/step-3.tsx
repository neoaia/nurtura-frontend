import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useBackWarning } from "../../../../hooks/shared/useBackWarning";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const SSID_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const PASSWORD_CHAR_UUID = "1c95d5e3-d8f7-413a-bf3d-7a2e5d7be87e";
const STATUS_CHAR_UUID = "9a8ca5e3-d8f7-413a-bf3d-7a2e5d7be123";
const MONITOR_TRANSACTION_ID = "wifi-status-monitor";

export default function AddNewRack3() {
  const { deviceId } = useLocalSearchParams();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isProcessed = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscriptionRef = useRef<any>(null);

  const isDirty = !!ssid || !!password;
  const { showModal, handleConfirm, handleCancel } = useBackWarning(isDirty);

  const cancelMonitor = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current = null;
    }
  };

  const handleConnect = async () => {
    if (!deviceId) {
      Alert.alert("Error", "No device connected. Go back to Step 1.");
      return;
    }

    if (!ssid.trim() || !password.trim()) {
      Alert.alert(
        "Input Required",
        "Please enter both WiFi name and password.",
      );
      return;
    }

    setLoading(true);
    isProcessed.current = false;

    try {
      console.log("Step 1: Starting to monitor status characteristic...");

      subscriptionRef.current = bleManager.monitorCharacteristicForDevice(
        deviceId as string,
        SERVICE_UUID,
        STATUS_CHAR_UUID,
        async (error, char) => {
          if (!subscriptionRef.current) return;

          if (error) {
            console.log("Monitor error:", error.message);
            return;
          }

          if (!char || !char.value) {
            console.log("No data in characteristic");
            return;
          }

          try {
            const status = Buffer.from(char.value, "base64").toString().trim();
            console.log(">>> Received status from ESP32:", status);

            if (
              (status === "connected" || status === "failed") &&
              !isProcessed.current
            ) {
              isProcessed.current = true;
              subscriptionRef.current = null;

              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }

              setLoading(false);

              if (status === "connected") {
                console.log("WiFi connection SUCCESS!");
                Alert.alert("Success!", "Rack connected to WiFi!", [
                  {
                    text: "Continue",
                    onPress: () =>
                      router.push({
                        pathname: "/(tabs)/(add_pages)/(addNewRack)/step-4",
                        params: { deviceId },
                      }),
                  },
                ]);
              } else if (status === "failed") {
                console.log("WiFi connection FAILED");
                Alert.alert(
                  "Connection Failed",
                  "Could not connect to WiFi. Please check:\n\n• WiFi name is correct\n• Password is correct\n• Network is 2.4GHz (not 5GHz)\n\nYou can try again.",
                );
              }
            }
          } catch (parseError) {
            console.error("Error parsing status:", parseError);
          }
        },
        MONITOR_TRANSACTION_ID,
      );

      console.log("Step 2: Waiting for monitor to be ready...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Step 3: Sending SSID...");
      const ssidBase64 = Buffer.from(ssid).toString("base64");
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        SSID_CHAR_UUID,
        ssidBase64,
      );

      console.log("Step 4: Waiting before sending password...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("Step 5: Sending password...");
      const passwordBase64 = Buffer.from(password).toString("base64");
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        PASSWORD_CHAR_UUID,
        passwordBase64,
      );

      console.log(
        "Step 6: Credentials sent! Waiting for ESP32 to test WiFi...",
      );

      timeoutRef.current = setTimeout(() => {
        if (!isProcessed.current) {
          console.log("TIMEOUT: ESP32 didn't respond");
          isProcessed.current = true;
          setLoading(false);
          cancelMonitor();
          Alert.alert(
            "Connection Timeout",
            "The rack took too long to respond. The network may be unavailable or credentials are incorrect.",
          );
        }
      }, 45000);
    } catch (e: any) {
      console.error("Bluetooth error:", e);
      setLoading(false);
      isProcessed.current = true;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      cancelMonitor();

      Alert.alert(
        "Bluetooth Error",
        "Could not communicate with rack. Make sure it's still connected.",
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 40 }}
      >
        <Text className="text-2xl font-bold mb-6">Connect to WiFi</Text>

        <TextInputField
          label="WiFi Name (SSID)"
          onChangeText={setSsid}
          value={ssid}
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInputField
          label="WiFi Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          autoCapitalize="none"
          editable={!loading}
        />

        {loading && (
          <Text className="text-gray-500 text-center mt-4">
            Testing connection... This may take up to 30 seconds.
          </Text>
        )}
      </ScrollView>

      <BottomButton
        title="Send Credentials"
        onPress={handleConnect}
        disabled={loading}
      />

      <ConfirmationModal
        isVisible={showModal}
        onConfirm={handleConfirm}
        title="Go Back"
        message="Your WiFi credentials will be lost."
        confirmText="Continue"
        cancelText="Cancel"
        onCancel={handleCancel}
      />
    </View>
  );
}
