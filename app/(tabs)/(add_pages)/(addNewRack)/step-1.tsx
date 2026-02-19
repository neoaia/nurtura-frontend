import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Platform,
  PermissionsAndroid 
} from "react-native";
import { bleManager } from "@/utils/bluetooth/bleManager"; // FIXED: was 'manager'
import { router } from "expo-router";
import { typography } from "@/assets/fonts/Text";
import { State } from "react-native-ble-plx";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

export default function AddNewRack1() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') return true;
    
    if (Platform.Version < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    
    return (
      result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
      result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const startScan = async () => {
    const state = await bleManager.state();
    if (state !== State.PoweredOn) {
      Alert.alert("Bluetooth Off", "Please turn on Bluetooth.");
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert("Permissions Required", "Please grant Bluetooth permissions.");
      return;
    }

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
      }
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
      console.log("Connecting to:", device.id);
      
      const connectedDevice = await bleManager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      console.log("Connected successfully!");
      
      Alert.alert("Connected!", "Proceeding to verification...", [
        {
          text: "OK",
          onPress: () => router.push({
            pathname: "/(tabs)/(add_pages)/(addNewRack)/step-2",
            params: { deviceId: device.id }
          })
        }
      ]);
    } catch (e: any) {
      console.error("Connection error:", e);
      Alert.alert("Error", "Could not connect to Rack. Try again.");
    }
  };

  useEffect(() => {
    return () => bleManager.stopDeviceScan();
  }, []);

  return (
    <View className="flex-1 bg-white p-6">
      <Text style={typography["h1-bold"]} className="mt-10 mb-2">
        Find your Rack
      </Text>
      <Text style={typography["subheader"]} className="mb-6">
        Select your Nurtura Rack from the list below.
      </Text>
      
      {isScanning && (
        <View className="items-center mb-4">
          <ActivityIndicator size="small" color="#10b981" />
          <Text className="text-gray-500 mt-2">Scanning...</Text>
        </View>
      )}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !isScanning ? (
            <View className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 items-center">
              <Text className="text-gray-400 italic text-center">
                No racks found.{"\n"}Make sure your rack is powered on.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => connectToDevice(item)}
            className="p-5 bg-gray-50 mb-3 rounded-2xl border border-gray-100 flex-row justify-between items-center"
          >
            <View>
              <Text className="font-bold text-lg">
                {item.name || "Nurtura Rack"}
              </Text>
              <Text className="text-gray-400 text-xs">{item.id}</Text>
            </View>
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">Connect</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        onPress={startScan}
        disabled={isScanning}
        className={`p-4 rounded-2xl items-center mt-4 ${
          isScanning ? "bg-gray-200" : "bg-primary"
        }`}
      >
        <Text className="text-white font-bold">
          {isScanning ? "Scanning..." : devices.length > 0 ? "Scan Again" : "Search for Racks"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}