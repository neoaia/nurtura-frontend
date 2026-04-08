import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { TextInputField } from "@/components/shared/textInputField";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Ionicons } from "@expo/vector-icons";
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
  const { deviceId, macAddress } = useLocalSearchParams();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      } catch (_) {}
      subscriptionRef.current = null;
    }
  };

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

  const handleBackPress = () => {
    setShowBackConfirm(true);
  };

  const handleBackConfirmed = async () => {
    setShowBackConfirm(false);
    setLoading(true);
    console.log("[Step3] User confirmed back - resetting ESP32");

    try {
      const isConnected = await bleManager.isDeviceConnected(
        deviceId as string,
      );

      if (isConnected) {
        try {
          await bleManager.writeCharacteristicWithoutResponseForDevice(
            deviceId as string,
            SERVICE_UUID,
            RESET_CHAR_UUID,
            Buffer.from("FACTORY_RESET").toString("base64"),
          );
          console.log("[Step3] Reset command sent to ESP32");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
          console.log("[Step3] Reset command failed (continuing anyway):", e);
        }
      }

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
    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
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

    cancelMonitor();
    setLoading(true);
    isProcessed.current = false;

    try {
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
            console.log(
              "[Step3] Monitor error (may be expected):",
              error.message,
            );
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
                        // Forward both deviceId and the real MAC address
                        params: { deviceId, macAddress },
                      }),
                  },
                ]);
              } else {
                // Stay on this screen — let user fix credentials and retry
                console.log("[Step3] WiFi connection failed");
                isProcessed.current = false; // allow retry
                Alert.alert(
                  "Connection Failed",
                  "Could not connect to WiFi. Please check:\n\n• WiFi name is correct\n• Password is correct\n• Network is 2.4GHz (not 5GHz)",
                  [{ text: "Try Again", style: "cancel" }],
                );
              }
            }
          } catch (parseError) {
            console.error("[Step3] Error parsing status:", parseError);
          }
        },
        MONITOR_TRANSACTION_ID,
      );

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
        <Text style={typography["h1-bold"]} className="text-black mb-6">
          Connect to WiFi
        </Text>

        <TextInputField
          label="WiFi Name (SSID)"
          onChangeText={setSsid}
          value={ssid}
          autoCapitalize="none"
          editable={!loading}
        />

        {/* Password field with eye toggle */}
        <View className="relative">
          <TextInputField
            label="WiFi Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <DebouncedTouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#9ca3af"
            />
          </DebouncedTouchableOpacity>
        </View>

        {loading && (
          <Text className="text-gray-500 text-center mt-4">
            Testing connection... This may take up to 30 seconds.
          </Text>
        )}
      </ScrollView>

      <View className="pb-6">
        <BottomButton
          title="Send Credentials"
          onPress={handleConnect}
          disabled={loading}
        />
      </View>
    </View>
  );
}
