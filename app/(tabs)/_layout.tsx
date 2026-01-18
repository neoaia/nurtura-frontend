import { Tabs } from "expo-router";
import { useState } from "react";
import { Image, Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../globals.css";
import AddNewModal from "./addNew";

const Layout = () => {
  const [modalVisible, setModalVisible] = useState(false);

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
                style={{ width: 24, height: 24 }}
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
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="addNew"
          options={{
            title: "Add New",
            tabBarIcon: ({ focused }) => (
              <Pressable onPress={() => setModalVisible(true)}>
                <Image
                  source={require("@/assets/images/bottom-nav/bm-add-new.png")}
                  style={{ width: 56, height: 56 }}
                  resizeMode="contain"
                />
              </Pressable>
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
                    ? { width: 28, height: 28 }
                    : { width: 24, height: 24 }
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
                    ? { width: 28, height: 28 }
                    : { width: 24, height: 24 }
                }
                resizeMode="contain"
              />
            ),
          }}
        />
      </Tabs>

      {modalVisible && <AddNewModal onClose={() => setModalVisible(false)} />}
    </GestureHandlerRootView>
  );
};

export default Layout;
