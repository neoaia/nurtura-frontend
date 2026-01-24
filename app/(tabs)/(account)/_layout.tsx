import { typography } from "@/assets/fonts/Text";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, TextStyle } from "react-native";

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
            headerTitleAlign: "left",
          }}
        />
        <Stack.Screen
          name="security"
          options={{
            title: "Account Security",
            headerTitleAlign: "left",
          }}
        />
        <Stack.Screen
          name="change-pass"
          options={{
            title: "Change Password",
            headerTitleAlign: "left",
          }}
        />
        <Stack.Screen
          name="update-email-1"
          options={{
            headerTitle: () => (
              <Image
                source={require("@/assets/images/update-email/progress-bar-1.png")}
              />
            ),
            headerTitleAlign: "center",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="update-email-2"
          options={{
            headerTitle: () => (
              <Image
                source={require("@/assets/images/update-email/progress-bar-2.png")}
              />
            ),
            headerTitleAlign: "center",
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}
