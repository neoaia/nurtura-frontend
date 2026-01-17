import { Stack } from "expo-router";

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
        title: "",
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