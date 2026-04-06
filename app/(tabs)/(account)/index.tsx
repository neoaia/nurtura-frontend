import { typography } from "@/assets/fonts/Text";
import SecurityIcon from "@/assets/images/icons/lock.svg";
import LogoutIcon from "@/assets/images/icons/logout.svg";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal"; // Added
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
import { Dimensions, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userService } from "../../../services/userService";
import { UserDetails } from "../../../types/interface";

const logger = createLogger("AccountScreen");
const screenHeight = Dimensions.get("window").height; 

export default function AccountScreen() {
  const [savedValues, setSavedValues] = useState<Partial<UserDetails>>({});
  const [formValues, setFormValues] = useState<Partial<UserDetails>>({});
  const [isGoogleUser, setIsGoogleUser] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const { logout } = useAuth();
  const router = useRouter();

  const [tutorialStep, setTutorialStep] = useState(1);
  const TOTAL_STEPS = 2;

  const handleNextStep = () => {
    setTutorialStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : 0));
  };

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "User Profile",
          desc: "Access your personal account details, preferences, and security settings.",
          image: require("@/assets/nuri/pointing-down.png"),
          position: { bottom: 290, right: -50 },
          offset: screenHeight - 300,
          component: (
            <View className="items-center justify-center">
              <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                <Image
                  source={require("@/assets/images/bottom-nav/bm-account-inactive.png")}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          ),
        };
      case 2:
        return {
          title: "Time to Grow!",
          desc: "All done! Your plants can’t wait to sprout into action with you.",
          image: require("@/assets/nuri/waving.png"),
          position: { bottom: 0, right: -70 },
          offset: screenHeight / 2 - 100, 
          component: null,
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  // ── Data Fetching ─────────────────────────────────────────────────────────
  const { refetch: getUserInfo } = useFetch("/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const checkUserProvider = async () => {
    try {
      const authProvider = await SecureStore.getItemAsync("auth_provider");
      setIsGoogleUser(authProvider === "google");
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
        setSavedValues(response.userInfo);
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
    }, [])
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
                  (formValues.firstName || "") + " " + (formValues.lastName || "") || "User"
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

      {currentTutorial && (
        <OnboardingTutorialModal
          visible={tutorialStep > 0}
          onClose={handleNextStep}
          title={currentTutorial.title}
          subtitle={currentTutorial.desc}
          topOffset={currentTutorial.offset}
          characterImage={currentTutorial.image}
          characterPosition={currentTutorial.position}
        >
          {currentTutorial.component}
        </OnboardingTutorialModal>
      )}
    </SafeAreaView>
  );
}