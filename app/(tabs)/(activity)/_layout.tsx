import { Stack } from "expo-router";
// Siguraduhin na tama ang path at export ng typography mo
import { typography } from "@/assets/fonts/Text";
import { TextStyle } from "react-native"; // Optional: for type checking

export default function ActivityLayout() {
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
        name="activity"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="plant-care"
        options={{
          headerShown: true,
          title: "Plant Care Activity",
        }}
      />
      <Stack.Screen
        name="harvest"
        options={{
          headerShown: true,
          title: "Harvest Activity",
        }}
      />
      <Stack.Screen
        name="planting"
        options={{
          headerShown: true,
          title: "Planting Activity",
        }}
      />
    </Stack>
  );
}
