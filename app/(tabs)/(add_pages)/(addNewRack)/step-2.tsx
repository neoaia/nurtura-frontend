import { typography } from "@/assets/fonts/Text";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const DEVICE_ID_CHAR_UUID = "abc12345-1234-5678-1234-56789abcdef0";

export default function AddNewRack2() {
  const { deviceId } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const verifyWithESP32 = async (qrData: string) => {
    if (!deviceId) {
      Alert.alert("Error", "No device connected. Go back to Step 1.");
      return;
    }

    setVerifying(true);

    try {
      const isConnected = await bleManager.isDeviceConnected(
        deviceId as string,
      );
      if (!isConnected) {
        console.log("Device disconnected, reconnecting...");
        await bleManager.connectToDevice(deviceId as string);
        await bleManager.discoverAllServicesAndCharacteristicsForDevice(
          deviceId as string,
        );
      }

      const characteristic = await bleManager.readCharacteristicForDevice(
        deviceId as string,
        SERVICE_UUID,
        DEVICE_ID_CHAR_UUID,
      );

      if (!characteristic?.value) {
        throw new Error("Could not read device ID from rack");
      }

      const deviceMAC = Buffer.from(characteristic.value, "base64")
        .toString()
        .trim();
      const scannedMAC = qrData.trim();

      console.log("ESP32 MAC:", deviceMAC);
      console.log("QR MAC:", scannedMAC);

      if (scannedMAC.toLowerCase() === deviceMAC.toLowerCase()) {
        setVerifying(false);
        Alert.alert("Verified!", "Rack identity confirmed!", [
          {
            text: "Continue",
            onPress: () =>
              router.push({
                pathname: "/(tabs)/(add_pages)/(addNewRack)/step-3",
                params: { deviceId },
              }),
          },
        ]);
      } else {
        setVerifying(false);
        Alert.alert(
          "Verification Failed",
          `QR code doesn't match this rack.\n\nScanned: ${scannedMAC}\nDevice: ${deviceMAC}`,
        );
      }
    } catch (error: any) {
      setVerifying(false);
      console.error("Verification error:", error);
      Alert.alert(
        "Verification Error",
        "Could not verify device. Make sure the rack is still connected.",
      );
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    verifyWithESP32(data);
  };

  if (!permission) return <View className="flex-1 bg-white" />;

  return (
    <View className="flex-1 bg-white">
      {verifying && (
        <View
          style={StyleSheet.absoluteFill}
          className="z-50 bg-black/70 items-center justify-center"
        >
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-white mt-4 font-bold">
            Verifying Rack Identity...
          </Text>
        </View>
      )}

      {!scanning ? (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 34 }}
        >
          <View className="mb-9 items-center">
            <Image
              source={require("@/assets/images/add-new-rack/plant-rack.png")}
              className="w-40 h-40"
            />
          </View>

          <Text style={typography["h1-bold"]} className="text-black mb-3">
            Verify Connection
          </Text>
          <Text style={typography["subheader"]} className="text-gray-500 mb-6">
            Scan the QR code on your Nurtura Rack to verify its identity.
          </Text>

          <TouchableOpacity
            onPress={async () => {
              if (!permission.granted) {
                const res = await requestPermission();
                if (!res.granted) return;
              }
              setScanning(true);
            }}
            className="bg-primary p-4 rounded-2xl items-center shadow-sm"
          >
            <Text className="text-white font-bold text-lg">Scan QR Code</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View className="flex-1">
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
          <TouchableOpacity
            onPress={() => setScanning(false)}
            className="absolute top-12 left-6 bg-black/50 p-3 rounded-full"
          >
            <Text className="text-white font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
