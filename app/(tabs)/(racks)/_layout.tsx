import { typography } from "@/assets/fonts/Text";
import { Stack } from "expo-router";
import { TextStyle } from "react-native";

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
        headerTitleStyle: {
          ...(typography["h2-bold"] as TextStyle),
          color: "#424242",
        },
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
          title: "My First Rack",
        }}
      />
      <Stack.Screen
        name="care"
        options={{
          headerShown: true,
          title: "Plant Care Activity",
        }}
      />
      <Stack.Screen
        name="harvestHistory"
        options={{
          headerShown: true,
          title: "Harvest History",
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
