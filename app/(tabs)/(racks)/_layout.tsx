import { typography } from "@/assets/fonts/Text";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextStyle } from "react-native";

export default function RacksLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#fafafa" },
          headerBlurEffect: "light",
          headerBackTitle: "Back",
          headerShadowVisible: false,

          headerShown: true,
          headerTitleStyle: {
            ...(typography["h2-bold"] as TextStyle),
            color: "#424242",
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="[rackId]" options={{ headerShown: false }} />
        <Stack.Screen
          name="previously-owned"
          options={{
            headerShown: true,
            title: "Previously Owned Racks",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </>
  );
}
