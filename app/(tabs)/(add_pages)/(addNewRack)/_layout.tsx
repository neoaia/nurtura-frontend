import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../../globals.css";

export default function AddNewRackLayout() {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
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
            name="step-1"
            options={{
              headerTitle: () => (
                <Image source={require("@/assets/images/add-new-rack/progress-bar-1.png")} />
              ),
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="step-2"
            options={{
              headerTitle: () => (
                <Image source={require("@/assets/images/add-new-rack/progress-bar-2.png")} />
              ),
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="step-3"
            options={{
              headerTitle: () => (
                <Image source={require("@/assets/images/add-new-rack/progress-bar-3.png")} />
              ),
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="step-4"
            options={{
              headerTitle: () => (
                <Image source={require("@/assets/images/add-new-rack/progress-bar-4.png")} />
              ),
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="successScreen"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}