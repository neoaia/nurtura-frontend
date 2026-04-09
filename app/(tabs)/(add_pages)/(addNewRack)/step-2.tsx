import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService"; // adjust to your actual import path
import { bleManager } from "@/utils/bluetooth/bleManager";
import { Buffer } from "buffer";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
  const hasScannedRef = useRef(false);

  const { refetch: checkRackExists } = useFetch("/racks/check", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  useFocusEffect(
    useCallback(() => {
      hasScannedRef.current = false;
      setScanning(false);
      setVerifying(false);
    }, []),
  );

  const disconnectAndGoToStep1 = useCallback(async () => {
    if (deviceId) {
      try {
        try {
          await bleManager.writeCharacteristicWithoutResponseForDevice(
            deviceId as string,
            SERVICE_UUID,
            RESET_CHAR_UUID,
            Buffer.from("FACTORY_RESET").toString("base64"),
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
          console.log("[Step2] Reset command failed (non-fatal):", e);
        }
        const isConnected = await bleManager.isDeviceConnected(
          deviceId as string,
        );
        if (isConnected) {
          await bleManager.cancelDeviceConnection(deviceId as string);
        }
      } catch (e) {
        console.log("[Step2] Disconnect error (non-fatal):", e);
      }
    }
    router.replace("/(tabs)/(add_pages)/(addNewRack)/step-1");
  }, [deviceId]);

  const handleBackConfirmed = async () => {
    setShowBackConfirm(false);
    await disconnectAndGoToStep1();
  };

  const verifyWithESP32 = useCallback(
    async (qrData: string) => {
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

        if (scannedMAC.toLowerCase() !== deviceMAC.toLowerCase()) {
          setVerifying(false);
          hasScannedRef.current = false;
          Alert.alert(
            "Verification Failed",
            `QR code doesn't match this rack.\n\nScanned: ${scannedMAC}\nDevice: ${deviceMAC}`,
          );
          return;
        }

        // ✅ MAC matched — check if rack already exists in the backend
        console.log("[Step2] MAC verified. Checking if rack exists...");

        try {
          const result = await rackService.checkIfRackExists(checkRackExists, {
            macAddress: deviceMAC,
          });

          setVerifying(false);

          // Pass everything to Step 3 — it will handle both flows
          router.push({
            pathname: "/(tabs)/(add_pages)/(addNewRack)/step-3",
            params: {
              deviceId,
              macAddress: deviceMAC,
              rackExists: result.exists ? "true" : "false",
              existingRackName: result.rack?.name ?? "",
              existingRackUpdatedAt: result.rack?.updatedAt ?? "",
            },
          });
        } catch (checkError: any) {
          console.error("[Step2] Rack-exists check failed:", checkError);
          setVerifying(false);
          hasScannedRef.current = false;
          Alert.alert(
            "Check Failed",
            "Could not verify rack status. Please try again.",
          );
        }
      } catch (error: any) {
        setVerifying(false);
        hasScannedRef.current = false;
        console.error("[Step2] Verification error:", error);
        Alert.alert(
          "Verification Error",
          "Could not verify device. Make sure the rack is still connected.",
        );
      }
    },
    [deviceId, disconnectAndGoToStep1, checkRackExists],
  );

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (hasScannedRef.current || verifying) return;
      hasScannedRef.current = true;
      setScanning(false);
      verifyWithESP32(data);
    },
    [verifying, verifyWithESP32],
  );

  const handleScanPress = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    hasScannedRef.current = false;
    setScanning(true);
  };

  if (!permission) return <View className="flex-1 bg-white" />;

  return (
    <View className="flex-1 bg-white">
      <ConfirmationModal
        isVisible={showBackConfirm}
        title="Go Back?"
        message={`Going back will reset your rack to BLE provisioning mode:\n\n• WiFi connection will be cleared\n• MQTT will disconnect\n• Bluetooth will restart\n• The rack will be ready to pair again\n\nYou'll need to run the setup process again.`}
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
            <View className="mb-9 ml-4 items-start">
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

          <View className="pb-6">
            <BottomButton title="Scan QR Code" onPress={handleScanPress} />
          </View>
        </>
      ) : (
        <View className="flex-1">
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
          <DebouncedTouchableOpacity
            onPress={() => {
              hasScannedRef.current = false;
              setScanning(false);
            }}
            className="absolute top-12 left-6 bg-black/50 p-3 rounded-full"
          >
            <Text className="text-white font-bold">Cancel</Text>
          </DebouncedTouchableOpacity>
        </View>
      )}
    </View>
  );
}
