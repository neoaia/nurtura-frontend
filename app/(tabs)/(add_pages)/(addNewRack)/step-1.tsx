import { typography } from "@/assets/fonts/Text";
import { BottomButton } from "@/components/shared/bottomButton";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import { bleManager } from "@/utils/bluetooth/bleManager";
import * as IntentLauncher from "expo-intent-launcher";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  PermissionsAndroid,
  Platform,
  Text,
  View,
} from "react-native";
import { State } from "react-native-ble-plx";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const RESET_CHAR_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

export default function AddNewRack1() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isEnablingBluetooth, setIsEnablingBluetooth] = useState(false);
  const lastConnectedIdRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          bleManager.stopDeviceScan();
        } catch (_) {}
        setIsScanning(false);
      };
    }, []),
  );

  useEffect(() => {
    return () => {
      bleManager.stopDeviceScan().catch(() => {});
    };
  }, []);

  const handleBack = useCallback(() => {
    router.replace("/(tabs)/(home)");
  }, []);

  useBackWarning(false, handleBack);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "ios") return true;

    const userAgreed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Bluetooth Permission Required",
        "Nurtura needs Bluetooth access to scan and connect to your rack. Please allow Bluetooth permissions on the next prompt.",
        [
          { text: "Deny", style: "cancel", onPress: () => resolve(false) },
          { text: "Allow", onPress: () => resolve(true) },
        ],
      );
    });

    if (!userAgreed) return false;

    if (Number(Platform.Version) < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "Bluetooth scanning requires location permission.",
          buttonPositive: "Allow",
          buttonNegative: "Deny",
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    const allGranted =
      result["android.permission.BLUETOOTH_CONNECT"] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      result["android.permission.BLUETOOTH_SCAN"] ===
        PermissionsAndroid.RESULTS.GRANTED;

    if (!allGranted) {
      const permanentlyDenied =
        result["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
        result["android.permission.BLUETOOTH_SCAN"] ===
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

      if (permanentlyDenied) {
        Alert.alert(
          "Permissions Denied",
          "Bluetooth permissions were permanently denied. Please enable them in your phone settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
      }
    }

    return allGranted;
  };

  const enableBluetooth = async (): Promise<boolean> => {
    const state = await bleManager.state();
    if (state === State.PoweredOn) return true;

    if (Platform.OS === "android") {
      setIsEnablingBluetooth(true);
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.BLUETOOTH_SETTINGS,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newState = await bleManager.state();
        return newState === State.PoweredOn;
      } catch (e) {
        console.log("Failed to open Bluetooth settings:", e);
        return false;
      } finally {
        setIsEnablingBluetooth(false);
      }
    }

    Alert.alert(
      "Bluetooth Off",
      "Please turn on Bluetooth in your settings to scan for racks.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  };

  const startScan = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const isBluetoothOn = await enableBluetooth();
    if (!isBluetoothOn) return;

    setDevices([]);
    setIsScanning(true);

    bleManager.startDeviceScan(
      [SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error("Scan error:", error);
          setIsScanning(false);
          return;
        }
        if (device) {
          console.log("Found device:", device.name, device.id);
          setDevices((prev) => {
            if (prev.some((d) => d.id === device.id)) return prev;
            return [...prev, device];
          });
        }
      },
    );

    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 15000);
  };

  const connectToDevice = async (device: any) => {
    bleManager.stopDeviceScan();
    setIsScanning(false);

    try {
      // Cancel any stale existing connection before attempting a new one
      const alreadyConnected = await bleManager.isDeviceConnected(device.id);
      if (alreadyConnected) {
        console.log("Device already connected, cancelling first...");
        await bleManager.cancelDeviceConnection(device.id);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log("Connecting to:", device.id);
      const connectedDevice = await bleManager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      lastConnectedIdRef.current = device.id;
      console.log("Connected successfully!");

      Alert.alert("Connected!", "Proceeding to verification...", [
        {
          text: "OK",
          onPress: () =>
            router.push({
              pathname: "/(tabs)/(add_pages)/(addNewRack)/step-2",
              params: { deviceId: device.id },
            }),
        },
      ]);
    } catch (e: any) {
      console.error("Connection error:", e);
      lastConnectedIdRef.current = null;
      Alert.alert("Error", "Could not connect to Rack. Try again.");
    }
  };

  const scanButtonTitle = isScanning
    ? "Scanning..."
    : isEnablingBluetooth
      ? "Enabling Bluetooth..."
      : devices.length > 0
        ? "Scan Again"
        : "Search for Racks";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <View className="flex-1 p-6">
        <Text style={typography["h1-bold"]} className="text-black mt-4 mb-2">
          Find your Rack
        </Text>
        <Text style={typography["subheader"]} className="mb-6">
          Select your Nurtura Rack from the list below.
        </Text>

        {(isScanning || isEnablingBluetooth) && (
          <View className="items-center mb-4">
            <ActivityIndicator size="small" color="#10b981" />
            <Text
              style={typography["subheader"]}
              className="text-grayText mt-2"
            >
              {isEnablingBluetooth ? "Enabling Bluetooth..." : "Scanning..."}
            </Text>
          </View>
        )}

        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            !isScanning ? (
              <View className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 items-center">
                <Text
                  style={typography["subheader"]}
                  className="text-grayText text-center"
                >
                  No racks found.{"\n"}Make sure your rack is powered on.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <DebouncedTouchableOpacity
              onPress={() => connectToDevice(item)}
              className="p-5 bg-gray-50 mb-3 rounded-2xl border-gray-100 border-[2px] flex-row justify-between items-center"
            >
              <View className="flex-1 mr-2">
                <Text
                  className="text-black mb-1"
                  style={typography["button-bold"]}
                >
                  {item.name || "Nurtura Rack"}
                </Text>
                <Text className="text-grayText" style={typography["subheader"]}>
                  {item.id}
                </Text>
              </View>

              <View className="bg-primary w-[120px] py-3 rounded-xl items-center justify-center">
                <Text style={typography["button-bold"]} className="text-white">
                  Connect
                </Text>
              </View>
            </DebouncedTouchableOpacity>
          )}
        />
      </View>

      <BottomButton
        title={scanButtonTitle}
        onPress={startScan}
        disabled={isScanning || isEnablingBluetooth}
      />
    </SafeAreaView>
  );
}
