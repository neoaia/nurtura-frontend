import React, { useState, useEffect, useRef } from "react";
import { ScrollView, Text, View, Alert, ActivityIndicator } from "react-native";
import { typography } from "@/assets/fonts/Text";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { router, useLocalSearchParams } from "expo-router";
import { Buffer } from "buffer";
import { manager } from "@/utils/bluetooth/bleManager"; 
import { Subscription } from "react-native-ble-plx";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b".toLowerCase();
const SSID_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26c1".toLowerCase();
const PASSWORD_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26c2".toLowerCase();
const STATUS_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26c3".toLowerCase();

export default function AddNewRack3() {
  const { deviceId } = useLocalSearchParams();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);

  // 1. Ref for subscription
  const wifiSubscription = useRef<Subscription | null>(null);

  // 2. Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wifiSubscription.current) {
        wifiSubscription.current.remove();
        wifiSubscription.current = null;
      }
    };
  }, []);

  const handleSendCredentials = async () => {
    if (!deviceId) return;
    if (!ssid.trim()) {
      Alert.alert("Missing Info", "Please enter your Wi-Fi name.");
      return;
    }

    setSending(true);

    try {
      // Ensure connection & rediscovery (Critical for Step 3)
      if (!(await manager.isDeviceConnected(deviceId as string))) {
          await manager.connectToDevice(deviceId as string);
          await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId as string);
      }

      // 3. Clear old subscription
      if (wifiSubscription.current) wifiSubscription.current.remove();

      // 4. Start Monitor
      wifiSubscription.current = manager.monitorCharacteristicForDevice(
        deviceId as string,
        SERVICE_UUID,
        STATUS_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            if (error.errorCode !== 2) {
                console.error("WiFi Monitor Error:", error);
                // Don't stop loading immediately, ESP32 might still be trying
            }
            return;
          }

          const status = Buffer.from(characteristic?.value ?? "", "base64").toString();
          console.log("WiFi Status:", status);

          if (status === "CONNECTED") {
            setSending(false);
            if (wifiSubscription.current) wifiSubscription.current.remove();
            
            Alert.alert("Success!", "Rack is online.", [
              { text: "Finish", onPress: () => router.push("/(tabs)/(add_pages)/(addNewRack)/step-4") }
            ]);
          } else if (status === "FAILED") {
            setSending(false);
            if (wifiSubscription.current) wifiSubscription.current.remove();
            Alert.alert("Failed", "Rack could not connect. Check password.");
          }
        }
      );

      // 5. Send Credentials (No response needed for speed)
      await manager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        SSID_CHAR_UUID,
        Buffer.from(ssid).toString("base64")
      );

      // Small delay to ensure packets don't collide
      await new Promise(r => setTimeout(r, 100));

      await manager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        PASSWORD_CHAR_UUID,
        Buffer.from(password).toString("base64")
      );

    } catch (error: any) {
      setSending(false);
      console.error("WiFi Config Error:", error);
      Alert.alert("Error", "Could not send credentials.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 34 }}>
        <Text style={typography["h1-bold"]} className="text-black mb-3">Add your Wi-Fi</Text>
        <View className="flex-col gap-4">
          <TextInputField label="Wi-Fi Name" value={ssid} onChangeText={setSsid} editable={!sending} />
          <TextInputField label="Password" value={password} onChangeText={setPassword} secureTextEntry editable={!sending} />
        </View>
        {sending && <ActivityIndicator size="small" color="#10b981" className="mt-8" />}
      </ScrollView>
      <BottomButton title={sending ? "Connecting..." : "Connect Rack"} onPress={handleSendCredentials} disabled={sending} />
    </View>
  );
}