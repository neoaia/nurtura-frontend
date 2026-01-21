import { typography } from "@/assets/fonts/Text";
import { router, Stack, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Image, TextStyle, TouchableOpacity, View } from "react-native";

export default function RacksSubpagesLayout() {
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
        name="racks"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="rackInfo"
        options={{
          headerShown: true,
          title: "My First Rack",
          headerTitleAlign: "left",
          headerRight: () => (
            <View className="flex-row items-center pr-2">
              <TouchableOpacity
                onPress={() =>
                  router.push("/(tabs)/(racks)/racks_subpages/rackConnection")
                }
                className="py-2 px-2 mr-1"
              >
                <Image
                  source={require("@/assets/images/racks/connection.png")}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push("/(tabs)/(racks)/racks_subpages/editRack")
                }
                className="p-2"
              >
                <Image
                  source={require("@/assets/images/racks/edit.png")}
                  className="w-5 h-5"
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="care"
        options={{
          headerShown: true,
          title: "Plant Care Activity",
          headerTitleAlign: "left",
        }}
      />
      <Stack.Screen
        name="harvestHistory"
        options={{
          headerShown: true,
          title: "Harvest History",
          headerTitleAlign: "left",
        }}
      />
      <Stack.Screen
        name="harvestAction"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="editRack"
        options={{
          headerShown: true,
          title: "Edit Rack",
          headerTitleAlign: "left",
        }}
      />
    </Stack>
  );
}
