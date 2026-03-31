import { typography } from "@/assets/fonts/Text";
import { BottomButton } from "@/components/shared/bottomButton";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
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
const RESET_CHAR_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

export default function AddNewRack2() {
  const { deviceId } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // Reset camera state whenever this screen regains focus
  useFocusEffect(
    useCallback(() => {
      setScanning(false);
      setVerifying(false);
    }, []),
  );

  // Disconnect BLE and navigate back to step-1
  const disconnectAndGoToStep1 = useCallback(async () => {
    if (deviceId) {
      try {
        console.log("[Step2] Sending reset command to ESP32...");
        try {
          await bleManager.writeCharacteristicWithoutResponseForDevice(
            deviceId as string,
            SERVICE_UUID,
            RESET_CHAR_UUID,
            Buffer.from("FACTORY_RESET").toString("base64"),
          );
          console.log("[Step2] Reset command sent");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
          console.log("[Step2] Reset command failed (non-fatal):", e);
        }

        const isConnected = await bleManager.isDeviceConnected(
          deviceId as string,
        );
        if (isConnected) {
          await bleManager.cancelDeviceConnection(deviceId as string);
          console.log("[Step2] BLE disconnected");
        }
      } catch (e) {
        console.log("[Step2] Disconnect error (non-fatal):", e);
      }
    }
    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
  }, [deviceId]);

  const handleBackPress = () => {
    setShowBackConfirm(true);
  };

  const handleBackConfirmed = async () => {
    setShowBackConfirm(false);
    await disconnectAndGoToStep1();
  };

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
        setVerifying(false);
        Alert.alert(
          "Connection Lost",
          "The rack disconnected. Please go back and connect again.",
          [{ text: "Go Back", onPress: disconnectAndGoToStep1 }],
        );
        return;
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

  const handleScanPress = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setScanning(true);
  };

  if (!permission) return <View className="flex-1 bg-white" />;

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
        <>
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
            <Text
              style={typography["subheader"]}
              className="text-gray-500 mb-6"
            >
              Scan the QR code on your Nurtura Rack to verify its identity.
            </Text>
          </ScrollView>

          <View className="flex-row gap-3 px-6 pb-6">
            <BottomButton
              title="Back"
              onPress={handleBackPress}
            />
            <BottomButton
              title="Scan QR Code"
              onPress={handleScanPress}
            />
          </View>
        </>
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