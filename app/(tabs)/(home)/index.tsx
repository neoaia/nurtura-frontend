import { typography } from "@/assets/fonts/Text";
import { HighlightSkeleton } from "@/components/home/skeleton/highlightSkeleton";
import { RecentActivityBarSkeleton } from "@/components/home/skeleton/recentActivityBarSkeleton";
import { SummaryCardSkeleton } from "@/components/home/skeleton/summaryCardSkeleton";
import { ShimmerBlock } from "@/components/shared/skeleton/shimmerBlock";
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

  const { data, loading, error, refetch, addRack, getNotifications } =
    useHome();

  const { refetch: getUserInfo } = useFetch("/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNotificationPress = async () => {
    try {
      const notifications = await getNotifications();
      console.log("Notifications:", notifications);
      router.push("/notifications");
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleCardPress = (cardType: string) => {
    console.log("Card pressed:", cardType);
    if (cardType === "racks") router.push("/(tabs)/(racks)");
    if (cardType === "plants") router.push("/(tabs)/(plants)");
  };

  const handleAddRack = async () => {
    try {
      const result = await addRack({ name: "New Rack" });
      if (result.success) {
        console.log("Rack added successfully");
        // TODO: Show success message to user
      }
    } catch (error) {
      console.error("Failed to add rack:", error);
      // TODO: Show error message to user
    }
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const getUserInfoData = async () => {
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

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <ScrollView
          className="flex-1 bg-white"
          showsVerticalScrollIndicator={false}
        >
          {/* Header skeleton */}
          <View className="flex flex-row justify-between items-center px-5 mt-7">
            <ShimmerBlock width={160} height={28} borderRadius={8} />
            <ShimmerBlock width={24} height={24} borderRadius={12} />
          </View>

          <View className="flex-1 bg-white">
            <View className="bg-white py-5 w-full">
              <SummaryCardSkeleton />
            </View>

            {/* Highlight skeleton */}
            <View className="px-4">
              <HighlightSkeleton />
            </View>

            <View className="px-4 pb-8">
              <RecentActivityBarSkeleton />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>{error}</Text>
        <TouchableOpacity onPress={refetch}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex flex-row justify-between items-center px-5 mt-7">
          <Text style={typography["h1-bold"]} className="text-black">
            Hi {formValues.firstName || data.user.name}!
          </Text>
          <TouchableOpacity onPress={handleNotificationPress}>
            {data.user.hasNotifications ? (
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

        <View className="flex-1 bg-white">
          <View className="bg-white py-5 w-full">
            <SummaryCard cards={data.summary} onCardPress={handleCardPress} />
          </View>

          <View className="px-4">
            <Highlight
              title={data.highlight.title}
              description={data.highlight.description}
              buttonText={data.highlight.buttonText}
              onButtonPress={handleAddRack}
            />
          </View>

          <View className="px-4 pb-8">
            <RecentActivityBar activities={data.recentActivity} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
