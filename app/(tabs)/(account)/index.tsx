import { typography } from "@/assets/fonts/Text";
import SecurityIcon from "@/assets/images/icons/lock.svg";
import LogoutIcon from "@/assets/images/icons/logout.svg";
import { ProfileCard } from "@/components/settings/profileCard";
import ProfileCardSkeleton from "@/components/settings/skeleton/profileCardSkeleton";
import { MenuCard } from "@/components/shared/menubtn";

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

  const { refetch: getUserInfo } = useFetch("/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

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
        setIsLoadingProfile(false);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
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

          <View className="mb-4 w-full">
            {isLoadingProfile ? (
              <ProfileCardSkeleton />
            ) : (
              <ProfileCard
                name="Profile"
                username={
                  formValues.firstName + " " + formValues.lastName || " "
                }
                onPress={handleProfilePress}
              />
            )}
          </View>

          <View className="w-full gap-5 pt-5">
            {!isGoogleUser && (
              <MenuCard
                title="Account Security"
                description="Manage your password and email."
                icon={SecurityIcon}
                iconSize={20}
                route={"/(tabs)/(account)/security" as any}
              />
            )}

            <MenuCard
              type="red"
              title="Log Out"
              description="Sign out of your account."
              icon={LogoutIcon}
              iconSize={18}
              onPress={logout}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
