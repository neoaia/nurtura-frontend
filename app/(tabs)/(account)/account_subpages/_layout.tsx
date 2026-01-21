import { typography } from "@/assets/fonts/Text";
import { Stack, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { TextStyle } from "react-native";

export default function AccountSubpagesLayout() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          height: 100,
          paddingBottom: 10,
          paddingTop: 15,
          display: "flex",
        },
      });
    };
  }, [navigation]);

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
          headerTitleAlign: "left",
        }}
      />
      <Stack.Screen
        name="account-secu"
        options={{
          headerShown: true,
          title: "Account Security",
          headerTitleAlign: "left",
        }}
      />
      <Stack.Screen
        name="change-pass"
        options={{
          headerShown: true,
          title: "Change Password",
          headerTitleAlign: "left",
        }}
      />
      <Stack.Screen
        name="update-email"
        options={{
          headerShown: true,
          title: "Update Email",
          headerTitleAlign: "left",
        }}
      />
    </Stack>
  );
}
