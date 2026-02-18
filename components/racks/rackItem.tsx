import { typography } from "@/assets/fonts/Text";
import { useRackSensor } from "@/hooks/useRackSensor";
import { GetRackInfoDTO } from "@/types/rack.dto";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HumidityIcon from "../../assets/images/icons/rackItem/humidity.svg";
import MoistureIcon from "../../assets/images/icons/rackItem/moisture.svg";
import SeedIcon from "../../assets/images/icons/rackItem/seed.svg";
import TemperatureIcon from "../../assets/images/icons/rackItem/temperature.svg";

interface RackItemProps {
  rack: GetRackInfoDTO;
}

const RackItem: React.FC<RackItemProps> = ({ rack }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { id, name, plant, image, seeds, hasAlert = false, onPress } = rack;

  // Get real-time sensor data via websocket
  const { reading, deviceStatus, error } = useRackSensor(id);

  const handlePress = async () => {
    if (isLoading || !onPress) return;

    setIsLoading(true);
    try {
      await onPress();
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  // Determine connection status
  const getConnectionStatus = () => {
    if (error) {
      return {
        type: "error" as const,
        message: "Cannot connect to device",
        details: error,
      };
    }
    if (deviceStatus === "disconnected") {
      return {
        type: "error" as const,
        message: "Device is offline",
        details: "The rack is not connected to the network",
      };
    }
    if (!reading) {
      return {
        type: "connecting" as const,
        message: "Connecting to device...",
        details: "Please wait while we establish connection",
      };
    }

    // Calculate last update time
    const now = new Date();
    const lastUpdate = new Date(reading.timestamp || now);
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    let timeText = "";
    if (diffSecs < 60) timeText = "just now";
    else if (diffSecs < 3600)
      timeText = `${Math.floor(diffSecs / 60)} minutes ago`;
    else timeText = `${Math.floor(diffSecs / 3600)} hours ago`;

    return {
      type: "connected" as const,
      message: "Connected",
      details: `Last updated ${timeText}`,
    };
  };

  const connectionStatus = getConnectionStatus();

  // Handle status indicator press
  const handleStatusPress = () => {
    Alert.alert(connectionStatus.message, connectionStatus.details, [
      { text: "OK" },
    ]);
  };

  // Use real-time data if available, fallback to 0
  const displayData = {
    moisture: reading?.moisture ?? 0,
    humidity: reading?.humidity ?? 0,
    temperature: reading?.temperature ?? 0,
  };

  const isConnected = connectionStatus.type === "connected";

  // Render connection status indicator
  const renderStatusIndicator = () => {
    if (connectionStatus.type === "connecting") {
      return (
        <TouchableOpacity
          onPress={handleStatusPress}
          activeOpacity={0.7}
          className="w-5 h-5 items-center justify-center"
        >
          <ActivityIndicator size="small" color="#86975A" />
        </TouchableOpacity>
      );
    }

    if (connectionStatus.type === "error") {
      return (
        <TouchableOpacity
          onPress={handleStatusPress}
          activeOpacity={0.7}
          className="w-5 h-5 bg-red-500 rounded-full items-center justify-center"
        >
          <Text style={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
            !
          </Text>
        </TouchableOpacity>
      );
    }

    // Connected - show green dot
    return (
      <TouchableOpacity
        onPress={handleStatusPress}
        activeOpacity={0.7}
        className="w-3 h-3 bg-green-500 rounded-full"
      />
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      className={`bg-white rounded-2xl py-6 px-5 shadow-md border border-gray-100 w-full mb-5 ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      <View className="flex-row justify-between items-center mb-7">
        <View className="flex-row items-center gap-5 flex-1">
          <View className="w-14 h-14 bg-[#E5EDCF] rounded-xl items-center justify-center">
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-12 h-12"
                resizeMode="contain"
              />
            ) : (
              <Text className="text-3xl"></Text>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text
                style={typography["button-bold"]}
                className="text-black"
                numberOfLines={1}
              >
                {name}
              </Text>
              {hasAlert && (
                <View className="w-2.5 h-2.5 rounded-full bg-[#FF2121]" />
              )}
            </View>
            <Text
              style={typography["subheader"]}
              className="text-[#73883C]"
              numberOfLines={1}
            >
              {plant}
            </Text>
          </View>
        </View>

        {/* Connection Status Indicator */}
        <View className="ml-2">{renderStatusIndicator()}</View>
      </View>

      <View className="flex-row justify-center items-center w-full gap-10">
        <View className="flex-row items-center gap-1.5">
          <SeedIcon width={15} height={15} />
          <Text style={typography["label-bold"]} className="text-black">
            {seeds}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <MoistureIcon width={15} height={15} />
          <Text
            style={typography["label-bold"]}
            className={`${isConnected ? "text-black" : "text-gray-400"}`}
          >
            {displayData.moisture.toFixed(1)}%
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <HumidityIcon width={15} height={15} />
          <Text
            style={typography["label-bold"]}
            className={`${isConnected ? "text-black" : "text-gray-400"}`}
          >
            {displayData.humidity.toFixed(0)}%
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <TemperatureIcon width={15} height={15} />
          <Text
            style={typography["label-bold"]}
            className={`${isConnected ? "text-black" : "text-gray-400"}`}
          >
            {displayData.temperature.toFixed(1)}°C
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RackItem;
