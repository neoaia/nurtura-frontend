import { typography } from "@/assets/fonts/Text";
import { InfoModal } from "@/components/modals/infoModal";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import useFetch from "@/hooks/useFetch";
import { useRackSensor } from "@/hooks/useRackSensor";
import { rackService } from "@/services/rackService";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TextStyle, View } from "react-native";

// ─── Connection Status Indicator ─────────────────────────────────────────────

interface ConnectionIndicatorProps {
  rackId: string;
}

const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  rackId,
}) => {
  const { reading, deviceStatus, error } = useRackSensor(rackId);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

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

    const now = new Date();
    const lastUpdate = new Date(reading.timestamp || now);
    const diffSecs = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

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

  const status = getConnectionStatus();

  const handlePress = () => {
    setModalContent({ title: status.message, message: status.details });
    setModalVisible(true);
  };

  const renderIndicator = () => {
    if (status.type === "connecting") {
      return (
        <DebouncedTouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          className="w-7 h-7 items-center justify-center"
        >
          <ActivityIndicator size="small" color="#86975A" />
        </DebouncedTouchableOpacity>
      );
    }

    if (status.type === "error") {
      return (
        <DebouncedTouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          className="w-7 h-7 bg-red-500 rounded-full items-center justify-center"
        >
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "white" }}>
            !
          </Text>
        </DebouncedTouchableOpacity>
      );
    }

    return (
      <DebouncedTouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="w-4 h-4 bg-green-500 rounded-full"
      />
    );
  };

  return (
    <>
      {renderIndicator()}
      <InfoModal
        isVisible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        confirmText="OK"
        onConfirm={() => setModalVisible(false)}
      />
    </>
  );
};

// ─── RackIDLayout ─────────────────────────────────────────────────────────────

export default function RackIDLayout() {
  const { rackId, rackName: rackNameParam } = useLocalSearchParams<{
    rackId: string;
    rackName?: string;
  }>();
  const [rackName, setRackName] = useState(rackNameParam ?? "Loading...");

  const { refetch: getRackInfo } = useFetch(`/racks/${rackId}`, {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const fetchRackData = useCallback(async () => {
    try {
      const rackResponse = await rackService.getRackbyId(getRackInfo);
      if (rackResponse?.rack?.name) {
        setRackName(rackResponse.rack.name);
      } else if (rackNameParam) {
        setRackName(rackNameParam);
      } else {
        setRackName(`Rack ${rackId}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Request was cancelled") {
        return;
      }
      console.error("Failed to fetch rack name:", err);
      if (rackNameParam) {
        setRackName(rackNameParam);
      } else {
        setRackName(`Rack ${rackId}`);
      }
    }
  }, [rackId, getRackInfo, rackNameParam]);

  useEffect(() => {
    if (rackNameParam) {
      setRackName(rackNameParam);
    }
  }, [rackNameParam]);

  useFocusEffect(
    useCallback(() => {
      if (rackId) {
        fetchRackData();
      }
    }, [rackId, fetchRackData]),
  );

  const handleNavigation = useCallback(
    (pathname: string) => {
      router.push({ pathname: pathname as any, params: { rackId } });
    },
    [rackId],
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fafafa" },
        headerBlurEffect: "light",
        headerBackTitle: "Back",
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerShown: true,
        headerTitleStyle: {
          ...(typography["h2-bold"] as TextStyle),
          color: "#424242",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={() => ({
          title: rackName,
          headerTitleAlign: "left",
          headerRight: () => (
            <View className="flex-row items-center pr-2 gap-3">
              {/* Connection status — left of edit button */}
              <ConnectionIndicator rackId={rackId} />

              <DebouncedTouchableOpacity
                onPress={() =>
                  handleNavigation(`/(tabs)/(racks)/${rackId}/edit`)
                }
                activeOpacity={0.7}
                className="p-2 rounded-lg"
              >
                <Image
                  source={require("@/assets/images/racks/edit.png")}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </DebouncedTouchableOpacity>
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="care"
        options={{ title: "Plant Care Activity", headerTitleAlign: "left" }}
      />
      <Stack.Screen
        name="harvest-history"
        options={{ title: "Harvest History", headerTitleAlign: "left" }}
      />
      <Stack.Screen
        name="edit"
        options={{ title: "Edit Rack", headerTitleAlign: "left" }}
      />
      <Stack.Screen
        name="edit-rack-name"
        options={{ title: "Edit Rack Name", headerTitleAlign: "left" }}
      />
      <Stack.Screen name="success-screen" options={{ headerShown: false }} />
    </Stack>
  );
}
