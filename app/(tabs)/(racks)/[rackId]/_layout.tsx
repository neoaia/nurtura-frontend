import { typography } from "@/assets/fonts/Text";
import { Stack, router, useGlobalSearchParams } from "expo-router";
import { Image, TextStyle, TouchableOpacity, View } from "react-native";

export default function RackIDLayout() {
  const params = useGlobalSearchParams();

  // temporary id lang for testing loveu
  const rackId = params.rackId || "1";

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
        name="index"
        options={{
          title: `Rack ${rackId}`,
          headerTitleAlign: "left",
          headerRight: () => (
            <View className="flex-row items-center pr-2">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(racks)/[rackId]/connection",
                    params: { rackId: rackId },
                  })
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
                  router.push({
                    pathname: "/(tabs)/(racks)/[rackId]/edit",
                    params: { rackId: rackId },
                  })
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
        options={{ title: "Plant Care Activity", headerTitleAlign: "left" }}
      />

      <Stack.Screen
        name="harvest-history"
        options={{ title: "Harvest History", headerTitleAlign: "left" }}
      />

      <Stack.Screen
        name="edit"
        options={{ title: "Edit Rack", headerTitleAlign: "left" }}
      />

      <Stack.Screen
        name="connection"
        options={{ title: "Rack Connection", headerTitleAlign: "left" }}
      />

      <Stack.Screen
        name="edit-rack-name"
        options={{ title: "Rack Connection", headerTitleAlign: "left" }}
      />
    </Stack>
  );
}
