import { typography } from "@/assets/fonts/Text";
import { MenuCard } from "@/components/shared/menubtn";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityScreen() {
  const menuItems = [
    {
      title: "Plant Care Activity",
      desc: "View your watering and grow light activity.",
      icon: require("@/assets/images/plantcare-icon.png"),
      path: "/(tabs)/(activity)/plant-care",
    },
    {
      title: "Harvest Activity",
      desc: "View history of your harvests.",
      icon: require("@/assets/images/harvest-icon.png"),
      path: "/(tabs)/(activity)/harvest",
    },
    {
      title: "Planting Activity",
      desc: "View logs based on your planting activity.",
      icon: require("@/assets/images/planting-icon.png"),
      path: "/(tabs)/(activity)/planting",
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
            <View key={item.path} className="w-full mb-3">
              <MenuCard
                title={item.title}
                description={item.desc}
                iconSource={item.icon}
                route={item.path as any}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
