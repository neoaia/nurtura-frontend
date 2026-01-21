import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RackLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="racks"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
