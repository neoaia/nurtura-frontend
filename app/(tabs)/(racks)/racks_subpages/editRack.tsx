import React from "react";
import { ScrollView, View } from "react-native";

import { MenuCard } from "@/components/shared/menubtn";

const EditRack = () => {
  const menuItems = [
    {
      title: "Edit Name",
      desc: "Edit how you want to call your Nurtura Rack.",
      icon: require("@/assets/images/plantcare-icon.png"),
      path: "/(tabs)/(activity)/activity_subpages/plant-care",
      type: "green",
    },
    {
      title: "Remove Plant",
      desc: "Remove the plant on your Nurtura Rack.",
      icon: require("@/assets/images/harvest-icon.png"),
      path: "/(tabs)/(activity)/activity_subpages/harvest",
      type: "red",
    },
    {
      title: "Remove Nurtura Rack",
      desc: "Remove this rack from your acount.",
      icon: require("@/assets/images/planting-icon.png"),
      path: "/(tabs)/(activity)/activity_subpages/planting",
      type: "red",
    },
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="bg-white">
      <View className="flex justify-center items-center px-4 bg-white">
        {menuItems.map((item) => (
          <View key={item.path} className="w-full mb-3">
            <MenuCard
              title={item.title}
              description={item.desc}
              iconSource={item.icon}
              route={item.path as any}
              type={item.type}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default EditRack;
