import { typography } from "@/assets/fonts/Text";
import { Stack } from "expo-router";
import { TextStyle } from "react-native";

export default function AccountLayout() {
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
        name="account"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="user-info"
        options={{
          headerShown: true,
          title: "User Information",
        }}
      />
      <Stack.Screen
        name="account-secu"
        options={{
          headerShown: true,
          title: "Account Security",
        }}
      />
      <Stack.Screen
        name="change-pass"
        options={{
          headerShown: true,
          title: "Change Password",
        }}
      />
      <Stack.Screen
        name="update-email"
        options={{
          headerShown: true,
          title: "Update Email",
        }}
      />
    </Stack>
  );
}
