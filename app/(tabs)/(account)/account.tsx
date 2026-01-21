import { typography } from "@/assets/fonts/Text";
import { LogOutRow } from "@/components/settings/logoutTab";
import { ProfileCard } from "@/components/settings/profileCard";
import { SettingsRow } from "@/components/settings/settingsTab";

import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const menuItems = [
    {
      title: "User Information",
      icon: require("@/assets/images/user-info-icon.png"),
      path: "/(tabs)/(account)/account_subpages/user-info",
    },
    {
      title: "Account Security",
      icon: require("@/assets/images/security-icon.png"),
      path: "/(tabs)/(account)/account_subpages/account-secu",
    },
  ];

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex justify-center items-center px-4 bg-white">
          <View className="flex justify-start items-start w-full mb-2 mt-8 pl-3">
            <Text
              style={typography["title-bold"]}
              className="text-black text-5xl mb-[20px]"
            >
              Account
            </Text>
          </View>
          <View className="mb-6 w-full">
            <ProfileCard
              name="Juan Dela Cruz"
              username="JuanMasipag"
              iconSource={require("@/assets/images/user-icon-settings.png")}
            />
          </View>

          <View className="flex justify-center items-center bg-white">
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
