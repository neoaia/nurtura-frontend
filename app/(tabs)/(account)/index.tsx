import { typography } from "@/assets/fonts/Text";
import { LogOutRow } from "@/components/settings/logoutTab";
import { ProfileCard } from "@/components/settings/profileCard";
import { SettingsRow } from "@/components/settings/settingsTab";
import ProfileCardSkeleton from "@/components/settings/skeleton/profileCardSkeleton";

import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import { createLogger } from "@/utils/logger";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userService } from "../../../services/userService";
import { UserDetails } from "../../../types/interface";

const logger = createLogger("AccountScreen");

export default function AccountScreen() {
  const [savedValues, setSavedValues] = useState<Partial<UserDetails>>({});
  const [formValues, setFormValues] = useState<Partial<UserDetails>>({});
  const [isGoogleUser, setIsGoogleUser] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const { logout } = useAuth();
  const router = useRouter();

  const { refetch: getUserInfo } = useFetch("/api/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const menuItems = [
    {
      title: "Account Security",
      icon: require("@/assets/images/security-icon.png"),
      path: "/(tabs)/(account)/security",
      showCondition: !isGoogleUser,
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => item.showCondition);

  const checkUserProvider = async () => {
    try {
      logger.log("Checking auth provider from storage...");

      const authProvider = await SecureStore.getItemAsync("auth_provider");
      logger.log("Auth provider:", authProvider);

      if (authProvider === "google") {
        setIsGoogleUser(true);
        logger.log("✓ User is Google-only - hiding Account Security");
      } else {
        setIsGoogleUser(false);
        logger.log("✓ User has password auth - showing Account Security");
      }
    } catch (error) {
      logger.error("Error checking auth provider:", error);
      setIsGoogleUser(false);
    }
  };

  const getUserInfoData = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await userService.getUser(getUserInfo);
      if (response?.userInfo) {
        const data = {
          firstName: response.userInfo.firstName || "",
          middleName: response.userInfo.middleName || "",
          lastName: response.userInfo.lastName || "",
          suffix: response.userInfo.suffix || "",
          block: response.userInfo.block || "",
          street: response.userInfo.street || "",
          barangay: response.userInfo.barangay || "",
          city: response.userInfo.city || "",
        };
        setSavedValues(data);
        // only stop loading if fetch was successful
        setIsLoadingProfile(false);
      }
      // if no userInfo in response, stays loading (per spec)
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      // on error, stays loading (per spec — temporary)
    }
  };

  const handleProfilePress = () => {
    router.push("/(tabs)/(account)/user-info");
  };

  useFocusEffect(
    useCallback(() => {
      getUserInfoData();
      checkUserProvider();
    }, []),
  );

  useEffect(() => {
    setFormValues(savedValues);
  }, [savedValues]);

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
            {isLoadingProfile ? (
              <ProfileCardSkeleton />
            ) : (
              <ProfileCard
                name="Profile"
                username={
                  formValues.firstName + " " + formValues.lastName || " "
                }
                iconSource={require("@/assets/images/user-icon-settings.png")}
                onPress={handleProfilePress}
              />
            )}
          </View>

          <View className="flex justify-center items-center bg-white">
            {visibleMenuItems.map((item) => (
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
