import { Stack } from "expo-router";
import { Image } from "react-native";
import "../../../globals.css";

export default function AddNewPlantLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fafafa" },
        headerBlurEffect: "light",
        headerBackTitle: "Back",
        headerShadowVisible: false,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="addNewPlant1"
        options={{
          headerTitle: () => (
            <Image
              source={require("@/assets/images/add-new-plant/progress-bar-1.png")}
            />
          ),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="addNewPlant2"
        options={{
          headerTitle: () => (
            <Image
              source={require("@/assets/images/add-new-plant/progress-bar-2.png")}
            />
          ),
          headerShown: true,
        }}
      />
    </Stack>
  );
}
