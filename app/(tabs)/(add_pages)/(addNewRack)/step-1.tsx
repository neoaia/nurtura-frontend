import React, { useState, useEffect, useRef } from "react";
import { Image, ScrollView, Text, View, Alert, Linking, Platform, PermissionsAndroid, TouchableOpacity, ActivityIndicator } from "react-native";
import { State, Device } from "react-native-ble-plx";
import { typography } from "@/assets/fonts/Text";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { router } from "expo-router";
// Correct named import
import { manager } from "@/utils/bluetooth/bleManager"; 

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

export default function AddNewRack1() {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === State.PoweredOff) setStatus("Bluetooth is off");
      else if (state === State.PoweredOn) setStatus("Ready");
    }, true);

    return () => {
      subscription.remove();
      stopScan();
    };
  }, []);

  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'ios') return true;
    const apiLevel = parseInt(Platform.Version.toString(), 10);
    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;
  };

  const stopScan = (finalStatus?: string) => {
    manager.stopDeviceScan();
    setIsScanning(false);
    isScanningRef.current = false;
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
    setStatus(typeof finalStatus === 'string' ? finalStatus : "Ready");
  };

  const startScan = async () => {
    const state = await manager.state();
    if (state !== State.PoweredOn) {
      Alert.alert("Bluetooth Off", "Enable Bluetooth to find your Rack.", [
        { text: "Settings", onPress: () => Linking.openSettings() },
        { text: "Cancel", style: "cancel" }
      ]);
      return;
    }

    const hasPermission = await requestAndroidPermissions();
    if (!hasPermission) {
      setStatus("Permissions denied");
      return;
    }

    setDiscoveredDevices([]); 
    setIsScanning(true);
    isScanningRef.current = true;
    setStatus("Scanning...");

    scanTimeout.current = setTimeout(() => {
      if (isScanningRef.current) stopScan("Scan complete");
    }, 15000);

    manager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
      if (error) {
        stopScan("Scan error");
        return;
      }

      if (device) {
        setDiscoveredDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    stopScan("Connecting...");
    try {
      // Connect and discover services immediately
      const connectedDevice = await manager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      Alert.alert("Connected!", "Rack found and paired.", [
        { text: "Verify Rack", onPress: () => router.push({
            pathname: "/(tabs)/(add_pages)/(addNewRack)/step-2",
            params: { deviceId: device.id }
        })}
      ]);
    } catch (e) {
      console.error("Connection Error:", e);
      setStatus("Failed to connect");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 34 }}>
        <View className="mb-9 items-center">
          <Image source={require("@/assets/images/add-new-rack/plant-rack.png")} className="w-40 h-40" />
        </View>
        <Text style={typography["h1-bold"]} className="text-black mb-3">Connect to Nurtura</Text>
        <Text style={typography["subheader"]} className="mb-6 text-black">Status: <Text className="font-bold text-primary">{status}</Text></Text>
        
        <View className="mb-6">
          {discoveredDevices.map((device) => (
            <TouchableOpacity key={device.id} onPress={() => connectToDevice(device)} className="p-5 mb-3 bg-gray-50 rounded-2xl border border-gray-100 flex-row justify-between items-center">
               <Text className="font-bold text-black text-lg">{device.name || "NURTURA_V4"}</Text>
               <View className="bg-primary px-4 py-2 rounded-full"><Text className="text-white font-bold text-xs">CONNECT</Text></View>
            </TouchableOpacity>
          ))}
        </View>
        {!isScanning && <PrimaryButton title="Search for Racks" onPress={startScan} />}
        {isScanning && <ActivityIndicator size="large" color="#10b981" />}
      </ScrollView>
    </View>
  );
}