import { MenuCard } from "@/components/shared/menubtn";

import React from "react";
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountSecurityScreen() {
  const menuItems = [
    {
        title: "Change Password",
        desc: "Update your password to secure account.",
        icon: require("@/assets/images/key-icon.png"),
        path: "/(tabs)/(account)/change-pass",
    },
    {
        title: "Update E-mail",
        desc: "Update your e-mail to stay connected.",
        icon: require("@/assets/images/mail-icon.png"),
        path: "/(tabs)/(account)/update-email",
    },
  ];

  return (
    <SafeAreaView className="bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex justify-center items-center px-4 bg-white">
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