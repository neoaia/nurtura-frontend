import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const SSID_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const PASSWORD_CHAR_UUID = "1c95d5e3-d8f7-413a-bf3d-7a2e5d7be87e";
const STATUS_CHAR_UUID = "9a8ca5e3-d8f7-413a-bf3d-7a2e5d7be123";
const RESET_CHAR_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";
const MONITOR_TRANSACTION_ID = "wifi-status-monitor";

export default function AddNewRack3() {
  const { deviceId } = useLocalSearchParams();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const isProcessed = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscriptionRef = useRef<any>(null);

  const cancelMonitor = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (subscriptionRef.current) {
      try {
        bleManager.cancelTransaction(MONITOR_TRANSACTION_ID);
      } catch (_) { }
      subscriptionRef.current = null;
    }
  };

  // Disconnect BLE and go back to step-1
  const disconnectAndGoToStep1 = useCallback(async () => {
    cancelMonitor();
    if (deviceId) {
      try {
        const isConnected = await bleManager.isDeviceConnected(
          deviceId as string,
        );
        if (isConnected) {
          await bleManager.cancelDeviceConnection(deviceId as string);
          console.log("[Step3] BLE disconnected, returning to step-1");
        }
      } catch (e) {
        console.log("[Step3] Disconnect error (non-fatal):", e);
      }
    }
    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
  }, [deviceId]);

  // Handle back button - show confirmation modal
  const handleBackPress = () => {
    setShowBackConfirm(true);
  };

  // Confirmed back - reset ESP32 then disconnect
  const handleBackConfirmed = async () => {
    setShowBackConfirm(false);
    setLoading(true);
    console.log("[Step3] User confirmed back - resetting ESP32");

    try {
      const isConnected = await bleManager.isDeviceConnected(
        deviceId as string,
      );

      if (isConnected) {
        console.log("[Step3] Sending factory reset command to ESP32...");
        try {
          // Send reset command to ESP32
          await bleManager.writeCharacteristicWithoutResponseForDevice(
            deviceId as string,
            SERVICE_UUID,
            RESET_CHAR_UUID,
            Buffer.from("FACTORY_RESET").toString("base64"),
          );
          console.log("[Step3] Reset command sent to ESP32");
          // Give ESP32 time to process the reset
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
          console.log("[Step3] Reset command failed (continuing anyway):", e);
        }
      }

      // Always disconnect BLE regardless of reset success
      try {
        const stillConnected = await bleManager.isDeviceConnected(
          deviceId as string,
        );
        if (stillConnected) {
          await bleManager.cancelDeviceConnection(deviceId as string);
          console.log("[Step3] BLE disconnected after reset");
        }
      } catch (e) {
        console.log("[Step3] Final disconnect error:", e);
      }
    } catch (e) {
      console.log("[Step3] Error during reset:", e);
    }

    setLoading(false);
    // Navigate back to step-1
    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
  };

  const handleConnect = async () => {
    if (!deviceId) {
      Alert.alert("Error", "No device connected. Go back to Step 1.");
      return;
    }

    if (!ssid.trim() || !password.trim()) {
      Alert.alert("Input Required", "Please enter both WiFi name and password.");
      return;
    }

    // Cancel any monitor/timeout left over from a previous attempt
    cancelMonitor();
    setLoading(true);
    isProcessed.current = false;

    try {
      // Verify the BLE connection is still alive before writing.
      const isConnected = await bleManager.isDeviceConnected(
        deviceId as string,
      );
      if (!isConnected) {
        setLoading(false);
        Alert.alert(
          "Connection Lost",
          "The rack disconnected. Please go back and connect again.",
          [{ text: "Go Back", onPress: disconnectAndGoToStep1 }],
        );
        return;
      }

      console.log("[Step3] Starting status monitor...");
      subscriptionRef.current = bleManager.monitorCharacteristicForDevice(
        deviceId as string,
        SERVICE_UUID,
        STATUS_CHAR_UUID,
        async (error, char) => {
          if (!subscriptionRef.current) return;

          if (error) {
            // The BLE connection drops when the ESP32 switches its radio to
            // WiFi — this is expected and not a fatal error at this point.
            console.log("[Step3] Monitor error (may be expected):", error.message);
            return;
          }

          if (!char?.value) return;

          try {
            const status = Buffer.from(char.value, "base64").toString().trim();
            console.log("[Step3] Status received:", status);

            if (
              (status === "connected" || status === "failed") &&
              !isProcessed.current
            ) {
              isProcessed.current = true;
              cancelMonitor();
              setLoading(false);

              if (status === "connected") {
                console.log("[Step3] WiFi connected successfully!");
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
              } else {
                console.log("[Step3] WiFi connection failed");
                Alert.alert(
                  "Connection Failed",
                  "Could not connect to WiFi. Please check:\n\n• WiFi name is correct\n• Password is correct\n• Network is 2.4GHz (not 5GHz)\n\nTap \"Go Back\" to try a different network.",
                  [{ text: "Go Back", onPress: disconnectAndGoToStep1 }],
                );
              }
            }
          } catch (parseError) {
            console.error("[Step3] Error parsing status:", parseError);
          }
        },
        MONITOR_TRANSACTION_ID,
      );

      // Let the monitor settle before writing credentials
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("[Step3] Sending SSID...");
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        SSID_CHAR_UUID,
        Buffer.from(ssid).toString("base64"),
      );

      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("[Step3] Sending password...");
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        PASSWORD_CHAR_UUID,
        Buffer.from(password).toString("base64"),
      );

      console.log("[Step3] Credentials sent, waiting for ESP32...");

      timeoutRef.current = setTimeout(() => {
        if (!isProcessed.current) {
          console.log("[Step3] TIMEOUT waiting for WiFi response");
          isProcessed.current = true;
          setLoading(false);
          cancelMonitor();
          Alert.alert(
            "Connection Timeout",
            "The rack took too long to respond. Please go back and try again.",
            [{ text: "Go Back", onPress: disconnectAndGoToStep1 }],
          );
        }
      }, 45000);
    } catch (e: any) {
      console.error("[Step3] Error:", e);
      setLoading(false);
      isProcessed.current = true;
      cancelMonitor();
      Alert.alert(
        "Bluetooth Error",
        "Lost connection to the rack. Please go back and reconnect.",
        [{ text: "Go Back", onPress: disconnectAndGoToStep1 }],
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ConfirmationModal
        isVisible={showBackConfirm}
        title="Cancel WiFi Setup?"
        message="Going back will reset your rack to BLE provisioning mode:

• WiFi connection will be cleared
• MQTT will disconnect
• Bluetooth will restart
• The rack will be ready to pair again

Are you sure you want to reset?"
        confirmText="Yes, Reset Rack"
        cancelText="Continue Setup"
        onConfirm={handleBackConfirmed}
        onCancel={() => setShowBackConfirm(false)}
      />

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

      <View className="flex-row gap-3 px-6 pb-6">
        <BottomButton
          title="Back"
          onPress={handleBackPress}
          disabled={loading}
        />
        <BottomButton
          title="Send Credentials"
          onPress={handleConnect}
          disabled={loading}
        />
      </View>
    </View>
  );
}