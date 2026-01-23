import { typography } from "@/assets/fonts/Text";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextStyle } from "react-native";

export default function AccountLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#fafafa" },
          headerBlurEffect: "light",
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerTitleAlign: "left",
          headerShown: true,
          headerTitleStyle: {
            ...(typography["h2-bold"] as TextStyle),
            color: "#424242",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user-info"
          options={{
            title: "User Information",
          }}
        />
        <Stack.Screen
          name="security"
          options={{
            title: "Account Security",
          }}
        />
        <Stack.Screen
          name="change-pass"
          options={{
            title: "Change Password",
          }}
        />
        <Stack.Screen
          name="update-email"
          options={{
            title: "Update Email",
          }}
        />
      </Stack>
    </>
  );
}
