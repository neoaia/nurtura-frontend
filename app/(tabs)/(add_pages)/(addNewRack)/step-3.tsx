import React, { useState, useRef } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { TextInputField } from "@/components/shared/textInputField";
import { router, useLocalSearchParams } from "expo-router";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const SSID_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const PASSWORD_CHAR_UUID = "1c95d5e3-d8f7-413a-bf3d-7a2e5d7be87e";
const STATUS_CHAR_UUID = "9a8ca5e3-d8f7-413a-bf3d-7a2e5d7be123";

export default function AddNewRack3() {
  const { deviceId } = useLocalSearchParams();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isProcessed = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleConnect = async () => {
    if (!deviceId) {
      Alert.alert("Error", "No device connected. Go back to Step 1.");
      return;
    }

    if (!ssid.trim() || !password.trim()) {
      Alert.alert("Input Required", "Please enter both WiFi name and password.");
      return;
    }

    setLoading(true);
    isProcessed.current = false;
    let subscription: any = null;

    try {
      console.log("Step 1: Starting to monitor status characteristic...");

      subscription = bleManager.monitorCharacteristicForDevice(
        deviceId as string,
        SERVICE_UUID,
        STATUS_CHAR_UUID,
        async (error, char) => {
          if (error) {
            console.log("Monitor error:", error.message);
          }

          if (!char || !char.value) {
            console.log("No data in characteristic");
            return;
          }

          try {
            const status = Buffer.from(char.value, "base64").toString().trim();
            console.log(">>> Received status from ESP32:", status);

            if ((status === "connected" || status === "failed") && !isProcessed.current) {
              isProcessed.current = true;

              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }

              if (subscription) {
                subscription.remove();
                subscription = null;
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
                  "Could not connect to WiFi. Please check:\n\n• WiFi name is correct\n• Password is correct\n• Network is 2.4GHz (not 5GHz)\n\nYou can try again."
                );
              }
            }
          } catch (parseError) {
            console.error("Error parsing status:", parseError);
          }
        }
      );

      console.log("Step 2: Waiting for monitor to be ready...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Step 3: Sending SSID...");
      const ssidBase64 = Buffer.from(ssid).toString("base64");
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        SSID_CHAR_UUID,
        ssidBase64
      );

      console.log("Step 4: Waiting before sending password...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("Step 5: Sending password...");
      const passwordBase64 = Buffer.from(password).toString("base64");
      await bleManager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        PASSWORD_CHAR_UUID,
        passwordBase64
      );

      console.log("Step 6: Credentials sent! Waiting for ESP32 to test WiFi...");

      timeoutRef.current = setTimeout(() => {
        if (!isProcessed.current) {
          console.log("TIMEOUT: ESP32 didn't respond");
          isProcessed.current = true;
          setLoading(false);
          if (subscription) subscription.remove();
          
          Alert.alert(
            "Connection Timeout",
            "The rack took too long to respond. The network may be unavailable or credentials are incorrect."
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
      
      if (subscription) subscription.remove();
      
      Alert.alert(
        "Bluetooth Error",
        "Could not communicate with rack. Make sure it's still connected."
      );
    }
  };
  const { showModal, handleConfirm, handleCancel } =
    useBackWarning(!!onChangeText);
  const handleNextPress = () => {
    router.push("/(tabs)/(add_pages)/(addNewRack)/step-4");
  };

  return (
    <View className="flex-1 bg-white p-6">
      <ScrollView>
        <Text className="text-2xl font-bold mb-6 mt-10">Connect to WiFi</Text>

        <TextInputField
          label="WiFi Name (SSID)"
          onChangeText={setSsid}
          value={ssid}
          autoCapitalize="none"
          editable={!loading}
        />

        <View className="h-4" />

        <TextInputField
          label="WiFi Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          editable={!loading}
        />

        {loading && (
          <Text className="text-gray-500 text-center mt-4">
            Testing connection... This may take up to 30 seconds.
          </Text>
        )}

        <TouchableOpacity
          onPress={handleConnect}
          disabled={loading}
          className={`mt-10 p-4 rounded-2xl items-center ${
            loading ? "bg-gray-300" : "bg-primary"
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold text-lg ml-2">Connecting...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg">Send Credentials</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}