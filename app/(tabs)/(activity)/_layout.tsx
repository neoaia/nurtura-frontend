import { typography } from "@/assets/fonts/Text";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextStyle } from "react-native";

export default function ActivityLayout() {
  return (
    <>
      <BottomSheetModalProvider>
        <StatusBar style="dark" />
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
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="plant-care"
            options={{
              headerShown: true,
              title: "Plant Care Activity",
              headerTitleAlign: "left",
            }}
          />
          <Stack.Screen
            name="harvest"
            options={{
              headerShown: true,
              title: "Harvest Activity",
              headerTitleAlign: "left",
            }}
          />
          <Stack.Screen
            name="planting"
            options={{
              headerShown: true,
              title: "Planting Activity",
              headerTitleAlign: "left",
            }}
          />
          <Stack.Screen
            name="rack"
            options={{
              headerShown: true,
              title: "Rack Activity",
              headerTitleAlign: "left",
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </>
  );
}
