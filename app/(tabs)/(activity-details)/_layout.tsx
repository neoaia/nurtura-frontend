import { Stack } from "expo-router";

export default function ActivityLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#F8F9FA" },
        headerTintColor: "#333",
        headerTitleStyle: { fontWeight: "bold" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="activity" options={{ title: "Activity" }} />
      <Stack.Screen name="plant-care" options={{ title: "Plant Care" }} />
      <Stack.Screen name="harvest" options={{ title: "Harvest History" }} />
      <Stack.Screen name="planting" options={{ title: "Planting" }} />
    </Stack>
  );
}