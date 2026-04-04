import { typography } from "@/assets/fonts/Text";
import PlantCareIcon from "@/assets/images/icons/plantCare(Activity).svg";
import PlantIcon from "@/assets/images/icons/plants(Dashboard).svg";
import RackIcon from "@/assets/images/icons/rack(Add).svg";
import SeedIcon from "@/assets/images/icons/seed.svg";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { MenuCard } from "@/components/shared/menubtn";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityScreen() {
  const [tutorialStep, setTutorialStep] = useState(1);

  const TITLE_SECTION_HEIGHT = 100;
  const CARD_HEIGHT_WITH_MARGIN = 132;

  const handleNextStep = () => {
    if (tutorialStep < 4) setTutorialStep(tutorialStep + 1);
    else setTutorialStep(0);
  };

  const menuItems = [
    {
      title: "Plant Care Activity",
      desc: "View your watering and grow light activity.",
      icon: PlantCareIcon,
      path: "/(tabs)/(activity)/plant-care",
    },
    {
      title: "Harvest Activity",
      desc: "View history of your harvests.",
      icon: PlantIcon,
      path: "/(tabs)/(activity)/harvest",
    },
    {
      title: "Planting Activity",
      desc: "View logs based on your planting activity.",
      icon: SeedIcon,
      path: "/(tabs)/(activity)/planting",
    },
    {
      title: "Rack Activity",
      desc: "View logs based on your rack activity.",
      icon: RackIcon,
      path: "/(tabs)/(activity)/rack",
    },
  ];

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Plant Care Activity",
          tutorialDesc: "Track every action taken to nurture your plants — watering, lighting, and nutrient updates in one view.",
          image: require("@/assets/nuri/waving.png"),
          positionStyle: { bottom: 0, right: -70 },
          marginTop: TITLE_SECTION_HEIGHT,
          component: (
            <MenuCard 
              title={menuItems[0].title} 
              description={menuItems[0].desc}
              icon={menuItems[0].icon} 
            />
          )
        };
      case 2:
        return {
          title: "Harvest Activity",
          tutorialDesc: "Track every harvesting task and record your plants’ yields in one organized view.",
          image: require("@/assets/nuri/pointing-up.png"),
          positionStyle: { bottom: 0, right: -50 },
          marginTop: TITLE_SECTION_HEIGHT + CARD_HEIGHT_WITH_MARGIN,
          component: (
            <MenuCard 
              title={menuItems[1].title} 
              description={menuItems[1].desc} 
              icon={menuItems[1].icon} 
            />
          )
        };
      case 3:
        return {
          title: "Planting Activity",
          tutorialDesc: "Track all plant updates and interactions — growth, care actions, and status changes in one view.",
          image: require("@/assets/nuri/pointing-down.png"),
          positionStyle: { top: 30, right: -60 },
          marginTop: TITLE_SECTION_HEIGHT + (CARD_HEIGHT_WITH_MARGIN * 2),
          component: (
            <MenuCard 
              title={menuItems[2].title} 
              description={menuItems[2].desc} 
              icon={menuItems[2].icon}
            />
          )
        };
        case 4:
        return {
          title: "Rack Activity",
          tutorialDesc: "Track all rack updates and interactions — growth, care actions, and status changes in one view.",
          image: require("@/assets/nuri/joyful.png"),
          positionStyle: { bottom: 345, left: -60 },
          marginTop: TITLE_SECTION_HEIGHT + (CARD_HEIGHT_WITH_MARGIN * 3),
          component: (
            <MenuCard
              title={menuItems[3].title} 
              description={menuItems[3].desc} 
              icon={menuItems[3].icon} 
            />
          )
        };
      default:
        return { title: "", tutorialDesc: "", image: null, component: null, marginTop: 0 };
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex px-4 bg-white">
          <View className="w-full mb-2 mt-8 pl-3">
            <Text style={typography["title-bold"]} className="text-black mb-[20px]">
              Activity
            </Text>
          </View>

          {menuItems.map((item) => (
            <View key={item.path} className="w-full mb-5">
              <MenuCard
                title={item.title}
                description={item.desc}
                icon={item.icon}
                route={item.path as any}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FLOATING TUTORIAL OVERLAY */}
      <OnboardingTutorialModal
        visible={tutorialStep > 0}
        onClose={handleNextStep}
        title={currentTutorial.title}
        subtitle={currentTutorial.tutorialDesc}
        topOffset={currentTutorial.marginTop}
        characterImage={currentTutorial.image}
        characterPosition={currentTutorial.positionStyle}
      >
        {currentTutorial.component}
      </OnboardingTutorialModal>
    </SafeAreaView>
  );
}