import { typography } from "@/assets/fonts/Text";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextStyle } from "react-native";

export default function HomeLayout() {
  return (
    <>
      <StatusBar style="light" />
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
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{ title: "Notifications", headerTitleAlign: "left" }}
        />
      </Stack>
    </>
  );
}
