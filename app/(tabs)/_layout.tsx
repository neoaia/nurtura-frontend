import { AddNewModal } from "@/components/modals/addNewModal";
import { Tabs, useSegments } from "expo-router"; // Added useSegments
import { useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../globals.css";

const Layout = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const segments = useSegments();

  const hideTabBar = segments.length > 2;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 100,
            paddingBottom: 10,
            paddingTop: 15,
            display: hideTabBar ? "none" : "flex",
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("@/assets/images/bottom-nav/bm-home-active.png")
                    : require("@/assets/images/bottom-nav/bm-home-inactive.png")
                }
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="(racks)"
          options={{
            title: "Racks",
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("@/assets/images/bottom-nav/bm-rack-active.png")
                    : require("@/assets/images/bottom-nav/bm-rack-inactive.png")
                }
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(add_pages)"
          options={{
            title: "Add New",
            tabBarStyle: { display: "none" },
            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                }}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: -45,
                  display: hideTabBar ? "none" : "flex",
                }}
              >
                <Image
                  source={require("@/assets/images/bottom-nav/bm-add-new.png")}
                  style={{ width: 56, height: 56 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="(activity)"
          options={{
            title: "Activity",
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("@/assets/images/bottom-nav/bm-activity-active.png")
                    : require("@/assets/images/bottom-nav/bm-activity-inactive.png")
                }
                style={
                  focused
                    ? { width: 26, height: 26 }
                    : { width: 22, height: 22 }
                }
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="(account)"
          options={{
            title: "Account",
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("@/assets/images/bottom-nav/bm-account-active.png")
                    : require("@/assets/images/bottom-nav/bm-account-inactive.png")
                }
                style={
                  focused
                    ? { width: 26, height: 26 }
                    : { width: 22, height: 22 }
                }
                resizeMode="contain"
              />
            ),
          }}
        />
      </Tabs>

      <AddNewModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </GestureHandlerRootView>
  );
};

export default Layout;
