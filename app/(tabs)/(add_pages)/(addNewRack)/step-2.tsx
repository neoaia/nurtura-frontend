import React, { useState, useEffect, useRef } from "react";
import { Image, ScrollView, Text, View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { typography } from "@/assets/fonts/Text";
import { router, useLocalSearchParams } from "expo-router";
import { Buffer } from "buffer";
import { manager } from "@/utils/bluetooth/bleManager"; 
import { Subscription } from "react-native-ble-plx";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b".toLowerCase();
const VERIFY_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9".toLowerCase();

export default function AddNewRack2() {
  const { deviceId } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 1. Ref to track the monitor subscription
  const monitorRef = useRef<Subscription | null>(null);

  // 2. Cleanup on screen exit
  useEffect(() => {
    return () => {
      if (monitorRef.current) {
        monitorRef.current.remove();
        monitorRef.current = null;
      }
    };
  }, []);

  const verifyWithESP32 = async (macFromQR: string) => {
    if (!deviceId) return;
    setVerifying(true);

    try {
      // Clear any existing monitor before starting a new one
      if (monitorRef.current) {
        monitorRef.current.remove();
      }

      const isConnected = await manager.isDeviceConnected(deviceId as string);
      if (!isConnected) {
        await manager.connectToDevice(deviceId as string);
        await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId as string);
      }

      const base64Data = Buffer.from(macFromQR.toUpperCase().trim()).toString("base64");

      // 3. START MONITOR (Capture the subscription)
      monitorRef.current = manager.monitorCharacteristicForDevice(
        deviceId as string,
        SERVICE_UUID,
        VERIFY_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            // Error code 2 is "Operation cancelled", which we expect when we .remove()
            if (error.errorCode !== 2) {
              console.log("Monitor Error:", error.message);
              setVerifying(false);
            }
            return;
          }

          const response = Buffer.from(characteristic?.value ?? "", "base64").toString();
          if (response === "VERIFIED") {
            // 4. Success cleanup: stop monitoring
            if (monitorRef.current) {
              monitorRef.current.remove();
              monitorRef.current = null;
            }
            
            setVerifying(false);
            Alert.alert("Verified!", "Rack identity confirmed!", [
              { text: "Continue", onPress: () => router.push({
                  pathname: "/(tabs)/(add_pages)/(addNewRack)/step-3",
                  params: { deviceId }
                }) 
              }
            ]);
          }
        }
      );

      // 5. WRITE WITHOUT RESPONSE (More stable for Android)
      await manager.writeCharacteristicWithoutResponseForDevice(
        deviceId as string,
        SERVICE_UUID,
        VERIFY_CHARACTERISTIC_UUID,
        base64Data
      );

    } catch (error: any) {
      setVerifying(false);
      console.error("Write Error:", error);
      Alert.alert("Connection Issue", "Make sure you are still near the rack.");
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
        <View style={StyleSheet.absoluteFill} className="z-50 bg-black/70 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-white mt-4 font-bold">Verifying Rack Identity...</Text>
        </View>
      )}

      {!scanning ? (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 34 }}>
          <View className="mb-9 items-center">
            <Image source={require("@/assets/images/add-new-rack/plant-rack.png")} className="w-40 h-40" />
          </View>
          <Text style={typography["h1-bold"]} className="text-black mb-3">Verify connection</Text>
          <TouchableOpacity 
            onPress={async () => {
              if (!permission.granted) await requestPermission();
              setScanning(true);
            }} 
            className="bg-primary p-4 rounded-2xl items-center"
          >
            <Text className="text-white font-bold">Open Camera</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View className="flex-1">
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
        </View>
      )}
    </View>
  );
}