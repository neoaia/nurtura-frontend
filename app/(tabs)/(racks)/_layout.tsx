import { Stack } from "expo-router";

export default function RackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fafafa" },
        headerBlurEffect: "light",
        headerBackTitle: "Back",
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerShown: true,
        title: "",
      }}
    >
      <Stack.Screen
        name="racks"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="rackInfo"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="care"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="harvestHistory"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="harvestAction"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}
