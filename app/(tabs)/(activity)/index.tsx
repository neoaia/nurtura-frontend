import { typography } from "@/assets/fonts/Text";
import PlantCareIcon from "@/assets/images/icons/plantCare(Activity).svg";
import PlantIcon from "@/assets/images/icons/plants(Dashboard).svg";
import RackIcon from "@/assets/images/icons/rack(Add).svg";
import SeedIcon from "@/assets/images/icons/seed.svg";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { MenuCard } from "@/components/shared/menubtn";
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityScreen() {
  const [tutorialStep, setTutorialStep] = useState(1);
  const router = useRouter();

  const TITLE_SECTION_HEIGHT = 100;
  const CARD_HEIGHT_WITH_MARGIN = 132;

  const handleNextStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialStep(0); 
    }
  };

  const menuItems = [
    {
      title: "Plant Care Activity",
      desc: "View your watering and grow light activity.",
      icon: PlantCareIcon,
      path: "/(tabs)/(activity)/plant-care",
      iconSize: 25,
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
          title: menuItems[0].title,
          subtitle: menuItems[0].desc,
          image: require("@/assets/nuri/waving.png"),
          marginTop: TITLE_SECTION_HEIGHT,
          component: (
            <MenuCard 
              title={menuItems[0].title} 
              description={menuItems[0].desc} 
              icon={menuItems[0].icon} 
              iconSize={menuItems[0].iconSize}
            />
          )
        };
      case 2:
        return {
          title: menuItems[1].title,
          subtitle: menuItems[1].desc,
          image: require("@/assets/nuri/pointing-up.png"),
          marginTop: TITLE_SECTION_HEIGHT + CARD_HEIGHT_WITH_MARGIN, // 👈 Aligns with 2nd card
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
          title: menuItems[2].title,
          subtitle: menuItems[2].desc,
          image: require("@/assets/nuri/thinking.png"),
          marginTop: TITLE_SECTION_HEIGHT + (CARD_HEIGHT_WITH_MARGIN * 2),
          component: (
            <MenuCard 
              title={menuItems[2].title} 
              description={menuItems[2].desc} 
              icon={menuItems[2].icon} 
            />
          )
        };
      default:
        return { title: "", subtitle: "", image: null, component: null, marginTop: 0 };
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex justify-center items-center px-4 bg-white">
          <View className="flex justify-start items-start w-full mb-2 mt-8 pl-3">
            <Text
              style={typography["title-bold"]}
              className="text-black mb-[20px]"
            >
              Activity
            </Text>
          </View>

          {menuItems.map((item) => (
            <View key={item.path} className="w-full mb-5">
              <MenuCard
                title={item.title}
                description={item.desc}
                icon={item.icon}
                iconSize={item.iconSize}
                route={item.path as any}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* TUTORIAL MODAL */}
      <OnboardingTutorialModal
        visible={tutorialStep > 0}
        onClose={handleNextStep}
        title={currentTutorial.title}
        subtitle={currentTutorial.subtitle}
        topOffset={currentTutorial.marginTop}
        characterImage={currentTutorial.image}
      >
        {currentTutorial.component}
      </OnboardingTutorialModal>
    </SafeAreaView>
  );
}