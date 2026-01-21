import { typography } from "@/assets/fonts/Text";
import { Stack, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { TextStyle } from "react-native";

export default function ActivitySubpagesLayout() {
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
        name="activity"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="plant-care"
        options={{
          headerShown: true,
          title: "Plant Care Activity",
        }}
      />
      <Stack.Screen
        name="harvest"
        options={{
          headerShown: true,
          title: "Harvest Activity",
        }}
      />
      <Stack.Screen
        name="planting"
        options={{
          headerShown: true,
          title: "Planting Activity",
        }}
      />
    </Stack>
  );
}
