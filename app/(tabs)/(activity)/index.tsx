import { typography } from "@/assets/fonts/Text";
import PlantCareIcon from "@/assets/images/icons/plantCare(Activity).svg";
import PlantIcon from "@/assets/images/icons/plants(Dashboard).svg";
import RackIcon from "@/assets/images/icons/rack(Add).svg";
import SeedIcon from "@/assets/images/icons/seed.svg";
import { MenuCard } from "@/components/shared/menubtn";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityScreen() {
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

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex justify-center items-center px-4 bg-white">
          <View className="flex justify-start items-start w-full mb-2 mt-8 pl-3">
            <Text
              style={typography["title-bold"]}
              className="text-black   mb-[20px]"
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
    </SafeAreaView>
  );
}
