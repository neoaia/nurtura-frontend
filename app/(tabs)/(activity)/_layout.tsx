import { Stack } from "expo-router";

export default function ActivityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="activity"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
