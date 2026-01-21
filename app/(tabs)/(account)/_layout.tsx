import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AccountLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="account"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
