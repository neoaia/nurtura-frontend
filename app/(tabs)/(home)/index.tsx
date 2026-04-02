import { typography } from "@/assets/fonts/Text";
import { RecentActivityBarSkeleton } from "@/components/home/skeleton/recentActivityBarSkeleton";
import { SummaryCardSkeleton } from "@/components/home/skeleton/summaryCardSkeleton";
import useFetch from "@/hooks/useFetch";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActiveNotificationIcon from "../../../assets/images/icons/active_notification.svg";
import InactiveNotificationIcon from "../../../assets/images/icons/inactive_notification.svg";
import { Highlight } from "../../../components/home/highlight";
import { RecentActivityBar } from "../../../components/home/recentActivityBar";
import { SummaryCard } from "../../../components/home/summaryCard";
import { useHome } from "../../../hooks/useHome";
import { userService } from "../../../services/userService";
import { UserDetails } from "../../../types/interface";

const NOTIFICATION_ICON_SIZE = 24;

export default function HomeScreen() {
  const [savedValues, setSavedValues] = useState<Partial<UserDetails>>({});
  const [formValues, setFormValues] = useState<Partial<UserDetails>>({});

  const {
    user,
    highlight,
    summary,
    recentActivity,
    isSummaryLoading,
    isActivityLoading,
    error,
    refetch,
    addRack,
    getNotifications,
  } = useHome();

  const { refetch: getUserInfo } = useFetch("/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const handleNotificationPress = async () => {
    try {
      await getNotifications();
      router.push("/notifications");
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleCardPress = (cardType: string) => {
    if (cardType === "racks") router.push("/(tabs)/(racks)");
    if (cardType === "plants") router.push("/(tabs)/(plants)");
  };

  const handleAddRack = async () => {
    try {
      const result = await addRack({ name: "New Rack" });
      if (result.success) console.log("Rack added successfully");
    } catch (error) {
      console.error("Failed to add rack:", error);
    }
  };

  const getUserInfoData = async () => {
    try {
      const response = await userService.getUser(getUserInfo);
      if (response?.userInfo) {
        setSavedValues({
          firstName: response.userInfo.firstName || "",
          middleName: response.userInfo.middleName || "",
          lastName: response.userInfo.lastName || "",
          suffix: response.userInfo.suffix || "",
          block: response.userInfo.block || "",
          street: response.userInfo.street || "",
          barangay: response.userInfo.barangay || "",
          city: response.userInfo.city || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserInfoData();
      refetch();
    }, []),
  );

  useEffect(() => {
    setFormValues(savedValues);
  }, [savedValues]);

  // Global Error state na lang ang ibinabato dito
  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-red-500 mb-4">{error}</Text>
        <TouchableOpacity
          onPress={refetch}
          className="px-4 py-2 bg-blue-500 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Laging lumalabas agad habang hinihintay ang iba */}
        <View className="flex flex-row justify-between items-center px-5 mt-7">
          <Text style={typography["h1-bold"]} className="text-black">
            Hi {formValues.firstName || user.name}!
          </Text>
          <TouchableOpacity onPress={handleNotificationPress}>
            {user.hasNotifications ? (
              <ActiveNotificationIcon
                width={NOTIFICATION_ICON_SIZE}
                height={NOTIFICATION_ICON_SIZE}
              />
            ) : (
              <InactiveNotificationIcon
                width={NOTIFICATION_ICON_SIZE}
                height={NOTIFICATION_ICON_SIZE}
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-white mt-2">
          {/* Seryoso ang UX dito: Kung loading ang summary, skeleton lang muna */}
          <View className="bg-white py-5 w-full">
            {isSummaryLoading ? (
              <SummaryCardSkeleton />
            ) : (
              <SummaryCard cards={summary} onCardPress={handleCardPress} />
            )}
          </View>

          {/* Highlight Section (assuming static ito or mabilis makuha) */}
          <View className="px-4">
            <Highlight
              title={highlight.title}
              description={highlight.description}
              buttonText={highlight.buttonText}
              onButtonPress={handleAddRack}
            />
          </View>

          {/* Activity Section - Hiwalay na loading state din */}
          <View className="px-4 pb-8 mt-2">
            {isActivityLoading ? (
              <RecentActivityBarSkeleton />
            ) : (
              <RecentActivityBar activities={recentActivity} />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
