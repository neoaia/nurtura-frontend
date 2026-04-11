import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, TextStyle, View } from "react-native";

export default function RackIDLayout() {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();
  const [rackName, setRackName] = useState("Loading..."); // Default text habang nagfe-fetch

  const { refetch: getRackInfo } = useFetch(`/racks/${rackId}`, {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  // Fetch rack name para sa header
  useEffect(() => {
    let isActive = true;

    const fetchRackData = async () => {
      try {
        const rackResponse = await rackService.getRackbyId(getRackInfo);
        if (isActive && rackResponse?.rack?.name) {
          setRackName(rackResponse.rack.name);
        } else if (isActive) {
          setRackName(`Rack ${rackId}`); // Fallback
        }
      } catch (err) {
        console.error("Failed to fetch rack name:", err);
        if (isActive) setRackName(`Rack ${rackId}`); // Fallback on error
      }
    };

    if (rackId) fetchRackData();

    return () => {
      isActive = false;
    };
  }, [rackId, getRackInfo]);

  const handleNavigation = useCallback(
    (pathname: string) => {
      router.push({
        pathname: pathname as any,
        params: { rackId },
      });
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
        options={{
          title: rackName, // <-- Dito natin pinalitan para magamit yung fetched name
          headerTitleAlign: "left",
          headerRight: () => (
            <View className="flex-row items-center pr-2 gap-1">
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
        }}
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
