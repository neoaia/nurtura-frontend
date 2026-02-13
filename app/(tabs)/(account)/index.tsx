import { typography } from "@/assets/fonts/Text";
import { LogOutRow } from "@/components/settings/logoutTab";
import { ProfileCard } from "@/components/settings/profileCard";
import { SettingsRow } from "@/components/settings/settingsTab";

import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const {
    refetch: getUserInfo
  } = useFetch('/api/users', {
    method: 'GET',
    autoFetch: false,
    withAuth: true
  });

  const menuItems = [
    {
      title: "Account Security",
      icon: require("@/assets/images/security-icon.png"),
      path: "/(tabs)/(account)/security",
    },
  ];

  const getUserInfoData = async () => {
    try {
      const response = await getUserInfo();
      
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(tabs)/(account)/user-info")}
            >
              <ProfileCard
                name="Juan Dela Cruz"
                username="JuanMasipag"
                iconSource={require("@/assets/images/user-icon-settings.png")}
              />
            </TouchableOpacity>
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
              onPress={() => logout()}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
