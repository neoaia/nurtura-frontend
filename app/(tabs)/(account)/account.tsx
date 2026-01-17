import { LogOutRow } from "@/components/settings/logoutTab";
import { ProfileCard } from "@/components/settings/profileCard";
import { SettingsRow } from "@/components/settings/settingsTab";

import React from "react";
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const menuItems = [
    {
      title: 'User Information',
      icon: require('@/assets/images/user-info-icon.png'),
      path: '/(tabs)/(account)/user-info'
    },
    {
      title: 'Account Security',
      icon: require('@/assets/images/security-icon.png'),
      path: '/(tabs)/(account)/account-secu'
    }
  ];

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex justify-center items-center px-4 bg-white">
            <ProfileCard
                name="Juan Dela Cruz"
                username="JuanMasipag"
                iconSource={require("@/assets/images/user-icon-settings.png")}
            />

          {/* Mapped Items */}
          {menuItems.map((item) => (
            <View key={item.title} className="w-full mb-3">
              <SettingsRow
                    iconSource={item.icon}
                    label={item.title}
                    route={item.path as any}
                />
            </View>
          ))}

            <LogOutRow
                iconSource={require("@/assets/images/logout-icon.png")}
                label="Log Out"
                onPress={() => console.log("Pressed")}
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}