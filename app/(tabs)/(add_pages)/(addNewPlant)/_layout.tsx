import { Stack, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Image } from "react-native";
import "../../../globals.css";

export default function AddNewPlantLayout() {
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
