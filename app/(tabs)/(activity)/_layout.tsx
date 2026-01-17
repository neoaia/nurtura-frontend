import { Stack } from "expo-router";

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
        title: "Activity",
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