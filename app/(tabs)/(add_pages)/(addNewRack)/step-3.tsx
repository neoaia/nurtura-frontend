import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { RackExistsModal } from "@/components/modals/rackExistsModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { TextInputField } from "@/components/shared/textInputField";
import useFetch from "@/hooks/useFetch";
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
const RACK_NAME_CHAR_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const RESET_CHAR_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";
const MONITOR_TRANSACTION_ID = "wifi-status-monitor";

export default function AddNewRack3() {
  const {
    deviceId,
    macAddress,
    rackExists: rackExistsParam,
    existingRackName,
    existingRackUpdatedAt,
  } = useLocalSearchParams<{
    deviceId: string;
    macAddress: string;
    rackExists: string;
    existingRackName: string;
    existingRackUpdatedAt: string;
  }>();

  // Derived boolean — params are always strings in expo-router
  const isExistingRack = rackExistsParam === "true";

  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // Show the modal immediately on mount if this is an existing rack
  const [rackExistsModalVisible, setRackExistsModalVisible] =
    useState(isExistingRack);

  const isProcessed = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Only needed for the existing-rack path — register the rack after WiFi connects
  const { refetch: registerRack } = useFetch("/racks", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  // Format the date once for the modal
  const formattedDateRemoved = existingRackUpdatedAt
    ? new Date(existingRackUpdatedAt).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

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
        const isConnected = await bleManager.isDeviceConnected(deviceId);
        if (isConnected) {
          await bleManager.cancelDeviceConnection(deviceId);
          console.log("[Step3] BLE disconnected, returning to step-1");
        }
      } catch (e) {
        console.log("[Step3] Disconnect error (non-fatal):", e);
      }
    }
    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
  }, [deviceId]);

  const handleBackConfirmed = async () => {
    setShowBackConfirm(false);
    setLoading(true);

    try {
      const isConnected = await bleManager.isDeviceConnected(deviceId);
      if (isConnected) {
        try {
          await bleManager.writeCharacteristicWithoutResponseForDevice(
            deviceId,
            SERVICE_UUID,
            RESET_CHAR_UUID,
            Buffer.from("FACTORY_RESET").toString("base64"),
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
          console.log("[Step3] Reset command failed (continuing anyway):", e);
        }
        try {
          const stillConnected = await bleManager.isDeviceConnected(deviceId);
          if (stillConnected) await bleManager.cancelDeviceConnection(deviceId);
        } catch (e) {
          console.log("[Step3] Final disconnect error:", e);
        }
      }
    } catch (e) {
      console.log("[Step3] Error during reset:", e);
    }

    setLoading(false);
    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
  };

  // Called when WiFi connection succeeds and this rack already exists in the backend.
  // Runs Step 4's register logic here so we can skip straight to the success screen.
  const handleExistingRackWifiSuccess = async () => {
    const nameToSend = existingRackName || "Nurtura";

    // Best-effort: send the existing rack name to the ESP32
    try {
      const isConnected = await bleManager.isDeviceConnected(deviceId);
      if (isConnected) {
        await bleManager.writeCharacteristicWithoutResponseForDevice(
          deviceId,
          SERVICE_UUID,
          RACK_NAME_CHAR_UUID,
          Buffer.from(nameToSend).toString("base64"),
        );
        console.log("[Step3-existing] Rack name sent to ESP32:", nameToSend);
      }
    } catch (e) {
      console.log("[Step3-existing] Rack name write failed (non-fatal):", e);
    }

    try {
      const { data, error } = await registerRack({
        body: {
          macAddress,
          name: nameToSend,
        },
      });

      if (error || !data) {
        Alert.alert(
          "Error",
          error?.message || "Failed to re-register rack. Please try again.",
        );
        setLoading(false);
        return;
      }

      console.log("[Step3-existing] Rack re-registered successfully:", data);

      router.push({
        pathname: "/(tabs)/(add_pages)/(addNewRack)/successScreen",
        params: {
          type: "rack",
          title: "Rack re-added successfully!",
          subtitle: `Your rack "${nameToSend}" is now active again.`,
          finishTitle: "Finish",
          deviceId,
        },
      });
    } catch (e) {
      console.error("[Step3-existing] Failed to re-register rack:", e);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      setLoading(false);
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

    cancelMonitor();
    setLoading(true);
    isProcessed.current = false;

    try {
      const isConnected = await bleManager.isDeviceConnected(deviceId);
      if (!isConnected) {
        setLoading(false);
        Alert.alert(
          "Connection Lost",
          "The rack disconnected. Please go back and connect again.",
          [{ text: "Go Back", onPress: disconnectAndGoToStep1 }],
        );
        return;
      }

      subscriptionRef.current = bleManager.monitorCharacteristicForDevice(
        deviceId,
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

                if (isExistingRack) {
                  // Skip Step 4 — register and go straight to success
                  await handleExistingRackWifiSuccess();
                } else {
                  // Normal flow — proceed to Step 4
                  Alert.alert("Success!", "Rack connected to WiFi!", [
                    {
                      text: "Continue",
                      onPress: () =>
                        router.push({
                          pathname: "/(tabs)/(add_pages)/(addNewRack)/step-4",
                          params: { deviceId, macAddress },
                        }),
                    },
                  ]);
                }
              } else {
                console.log("[Step3] WiFi connection failed");
                isProcessed.current = false;
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

      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId,
        SERVICE_UUID,
        SSID_CHAR_UUID,
        Buffer.from(ssid).toString("base64"),
      );

      await new Promise((resolve) => setTimeout(resolve, 300));

      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId,
        SERVICE_UUID,
        PASSWORD_CHAR_UUID,
        Buffer.from(password).toString("base64"),
      );

      console.log("[Step3] Credentials sent, waiting for ESP32...");

      timeoutRef.current = setTimeout(() => {
        if (!isProcessed.current) {
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
        message={`Going back will reset your rack to BLE provisioning mode:\n\n• WiFi connection will be cleared\n• MQTT will disconnect\n• Bluetooth will restart\n• The rack will be ready to pair again\n\nAre you sure you want to reset?`}
        confirmText="Yes, Reset Rack"
        cancelText="Continue Setup"
        onConfirm={handleBackConfirmed}
        onCancel={() => setShowBackConfirm(false)}
      />

      {/* Shown only when the rack already exists — dismissed by tapping confirm */}
      <RackExistsModal
        isVisible={rackExistsModalVisible}
        title="Rack Already Registered"
        message="This rack was previously added to your account. Enter your WiFi credentials to reconnect it."
        confirmText="Got it"
        onConfirm={() => setRackExistsModalVisible(false)}
        rackName={existingRackName}
        dateRemoved={formattedDateRemoved}
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
