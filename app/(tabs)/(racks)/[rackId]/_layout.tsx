import { typography } from "@/assets/fonts/Text";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, TextStyle, TouchableOpacity, View } from "react-native";

export default function RackIDLayout() {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = useCallback(
    (pathname: string) => {
      if (isLoading || !rackId) return;

      setIsLoading(true);

      router.push({
        pathname: pathname as any,
        params: { rackId },
      });

      setTimeout(() => setIsLoading(false), 500);
    },
    [isLoading, rackId],
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
          title: `Rack ${rackId}`,
          headerTitleAlign: "left",
          headerRight: () => (
            <View className="flex-row items-center pr-2 gap-1">
              <TouchableOpacity
                onPress={() =>
                  handleNavigation(`/(tabs)/(racks)/${rackId}/connection`)
                }
                disabled={isLoading}
                activeOpacity={0.7}
                className={`p-2 rounded-lg ${isLoading ? "opacity-50" : ""}`}
              >
                <Image
                  source={require("@/assets/images/racks/connection.png")}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  handleNavigation(`/(tabs)/(racks)/${rackId}/edit`)
                }
                disabled={isLoading}
                activeOpacity={0.7}
                className={`p-2 rounded-lg ${isLoading ? "opacity-50" : ""}`}
              >
                <Image
                  source={require("@/assets/images/racks/edit.png")}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
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
        name="connection"
        options={{ title: "Rack Connection", headerTitleAlign: "left" }}
      />
      <Stack.Screen
        name="edit-rack-name"
        options={{ title: "Edit Rack Name", headerTitleAlign: "left" }}
      />
    </Stack>
  );
}
