import { AddNewModal } from "@/components/modals/addNewModal";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import { Tabs, useSegments } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../globals.css";

const screenHeight = Dimensions.get("window").height;

const Layout = () => {
  const segments = useSegments() as string[];
  const [modalVisible, setModalVisible] = useState(false);
  
  // ── Tutorial Logic ────────────────────────────────────────────────────────
  const [tutorialStep, setTutorialStep] = useState(1);
  const TOTAL_STEPS = 4;

  
  const isRacksTab = segments.includes("(racks)");
  const hideTabBar = segments.includes("(add_pages)");

  const handleNextStep = () => {
    setTutorialStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : 0));
  };

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Your Nurtura Rack",
          desc: "See every detail about your plants — from soil moisture to sunlight and growth progress.",
          image: require("@/assets/nuri/thinking.png"),
          position: { bottom: 0, right: -70 },
          offset: 130,
          component: (
            <View className="px-4 w-full">
              <RackItem
                rack={{
                  id: "tutorial-rack",
                  name: "Greens",
                  plant: "Empty",
                  seeds: 0,
                  water: 0,
                  humidity: 0,
                  temperature: 0,
                  hasAlert: false,
                  onPress: () => {},
                  onMorePress: () => {},
                }}
              />
            </View>
          )
        };
      case 2:
        return {
          title: "Add a Nurtura Rack",
          desc: "Set up a new home for your greens — link sensors, pumps, and lights with one tap.",
          image: require("@/assets/nuri/pointing-up.png"),
          position: { bottom: -60, right: -50 },
          offset: 320,
          component: (
            <View className="px-4 w-full">
              <AddRackButton onPress={() => {}} />
            </View>
          )
        };
      case 3:
        return {
          title: "Quick Add",
          desc: "Need a new rack or plant? Add it here in seconds and get growing right away.",
          image: require("@/assets/nuri/pointing-down.png"),
          position: { bottom: 290, right: -50 },
          offset: screenHeight - 300,
          component: (
            <View className="items-center justify-center">
               <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                <Text className="text-primary text-4xl">+</Text>
              </View>
            </View>
          )
        };
      case 4:
        return {
          title: "Activity",
          desc: "See what your garden’s been up to! Track watering, growth, and all your plant care moments.",
          image: require("@/assets/nuri/joyful.png"),
          position: { bottom: 290, right: -50 },
          offset: screenHeight - 300,
          component: (
            <View className="items-center justify-center">
              <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                <Image
                  source={require("@/assets/images/bottom-nav/bm-activity-inactive.png")}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          )
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

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
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? require("@/assets/images/bottom-nav/bm-home-active.png") : require("@/assets/images/bottom-nav/bm-home-inactive.png")}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="(racks)"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? require("@/assets/images/bottom-nav/bm-rack-active.png") : require("@/assets/images/bottom-nav/bm-rack-inactive.png")}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(add_pages)"
          options={{
            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: -45,
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
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? require("@/assets/images/bottom-nav/bm-activity-active.png") : require("@/assets/images/bottom-nav/bm-activity-inactive.png")}
                style={focused ? { width: 26, height: 26 } : { width: 22, height: 22 }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="(account)"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? require("@/assets/images/bottom-nav/bm-account-active.png") : require("@/assets/images/bottom-nav/bm-account-inactive.png")}
                style={focused ? { width: 26, height: 26 } : { width: 22, height: 22 }}
                resizeMode="contain"
              />
            ),
          }}
        />
      </Tabs>

      <AddNewModal isVisible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Tutorial Overlay - fixed segment check */}
      {isRacksTab && currentTutorial && (
        <OnboardingTutorialModal
          visible={tutorialStep > 0}
          onClose={handleNextStep}
          title={currentTutorial.title}
          subtitle={currentTutorial.desc}
          topOffset={currentTutorial.offset}
          characterImage={currentTutorial.image}
          characterPosition={currentTutorial.position}
        >
          {currentTutorial.component}
        </OnboardingTutorialModal>
      )}
    </GestureHandlerRootView>
  );
};

export default Layout;