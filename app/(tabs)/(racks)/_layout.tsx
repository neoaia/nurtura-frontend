import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RacksLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen name="[rackId]" />
      </Stack>
    </>
  );
}
