import { Stack } from "expo-router";

export default function RackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="racks"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
