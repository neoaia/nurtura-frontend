import { typography } from "@/assets/fonts/Text";
import { RecentActivityBarSkeleton } from "@/components/home/skeleton/recentActivityBarSkeleton";
import { SummaryCardSkeleton } from "@/components/home/skeleton/summaryCardSkeleton";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { useAsyncState } from "@/hooks/useAsyncState";
import useFetch from "@/hooks/useFetch";
import { useOnboarding } from "@/hooks/useOnboarding";
import { notificationService } from "@/services/notificationService";
import { plantService } from "@/services/plantService";
import { rackService } from "@/services/rackService";
import { userService } from "@/services/userService";
import { UserDetails } from "@/types/interface";
import { NotificationsResponseDTO } from "@/types/notification.dto";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
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

const NOTIFICATION_ICON_SIZE = 24;
const screenHeight = Dimensions.get("window").height;

const mockApiResponse = {
  highlight: {
    title: "Farm Efficiently",
    description: "Start growing your plant with Nurtura Racks",
    buttonText: "Add Rack",
  },
};

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState<Partial<UserDetails>>({});
  const [highlight] = useState(mockApiResponse.highlight);
  const [hasUnread, setHasUnread] = useState(false);
  const displayName = userInfo.firstName || "User";

  // ── Tutorial Logic ─────────────────────────────────────────────────────────
  const { shouldShow, tutorialStep, handleNextStep } = useOnboarding("home", 5);

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: `Hi ${displayName}, Let's Start Growing!`,
          desc: "I'm so excited for you to begin your smart garden journey. Let's grow together!",
          image: require("@/assets/nuri/waving.png"),
          position: { bottom: 0, right: -70 },
          offset: 300,
        };
      case 2:
        return {
          title: "Notification",
          desc: "Receive intelligent alerts based on your plants' needs and system insights for optimal care.",
          image: require("@/assets/nuri/waving.png"),
          position: { top: 250, right: -50 },
          offset: 50,
          component: (
            <View className="items-center justify-center">
              <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                {hasUnread ? (
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
              </View>
            </View>
          ),
        };
      case 3:
        return {
          title: "Quick View Cards",
          desc: "You can quickly check the status of your garden.",
          image: require("@/assets/nuri/proud.png"),
          position: { bottom: 80, right: -60 },
          offset: 150,
          component: (
            <View className="w-full">
              <SummaryCard
                cards={
                  summary && summary.length > 0
                    ? summary
                    : [
                        {
                          id: "racks",
                          type: "racks",
                          value: 0,
                          isActive: true,
                        },
                        {
                          id: "plants",
                          type: "plants",
                          value: 0,
                          isActive: true,
                        },
                      ]
                }
                onCardPress={() => {}}
              />
            </View>
          ),
        };
      case 4:
        return {
          title: "Home",
          desc: "Get a real-time overview of your plants, environment, and activity — all in one dashboard.",
          image: require("@/assets/nuri/pointing-down.png"),
          position: { bottom: 290, right: -50 },
          offset: screenHeight - 300,
          component: (
            <View className="items-center justify-center">
              <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                <Image
                  source={require("@/assets/images/bottom-nav/bm-home-inactive.png")}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          ),
        };
      case 5:
        return {
          title: "Racks",
          desc: "Racking up progress! Check how each section of your smart garden is thriving.",
          image: require("@/assets/nuri/pointing-down.png"),
          position: { bottom: 290, right: -50 },
          offset: screenHeight - 300,
          component: (
            <View className="items-center justify-center">
              <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                <Image
                  source={require("@/assets/images/bottom-nav/bm-rack-inactive.png")}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          ),
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  // ── States ─────────────────────────────────────────────────────────────────
  const {
    data: summary,
    loading: isSummaryLoading,
    setData: setSummary,
    setLoading: setSummaryLoading,
  } = useAsyncState<any[]>([]);

  const {
    data: recentActivity,
    loading: isActivityLoading,
    setData: setRecentActivity,
    setLoading: setActivityLoading,
  } = useAsyncState<any[]>([]);

  // ── useFetch hooks ─────────────────────────────────────────────────────────
  const { refetch: getUserInfo } = useFetch("/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: fetchRackCount } = useFetch("/racks/count", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: fetchPlantedQuantity } = useFetch(
    "/racks/planted-quantity",
    {
      method: "GET",
      autoFetch: false,
      withAuth: true,
    },
  );

  const { refetch: getPlantCare } = useFetch("/racks/activities/plant-care", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: fetchNotificationCount } = useFetch("/notifications", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  // ── Fetch logic ────────────────────────────────────────────────────────────
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await userService.getUser(getUserInfo);
      if (response?.userInfo) setUserInfo(response.userInfo);
    } catch (error) {
      console.error(error);
    }
  }, [getUserInfo]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading();
    try {
      const [rackCountResult, plantedQuantityResult] = await Promise.all([
        rackService.getRackQuantity(fetchRackCount),
        rackService.getTotalPlantedQuantity(fetchPlantedQuantity),
      ]);

      setSummary([
        {
          id: "racks",
          type: "racks",
          value: rackCountResult?.count ?? 0,
          isActive: true,
        },
        {
          id: "plants",
          type: "plants",
          value: plantedQuantityResult?.totalQuantity ?? 0,
          isActive: true,
        },
      ]);
    } catch (err) {
      setSummary([]);
    }
  }, [fetchRackCount, fetchPlantedQuantity, setSummaryLoading, setSummary]);

  const fetchActivity = useCallback(async () => {
    setActivityLoading();
    try {
      const careResponse = await plantService.getPlantCareActivities(
        getPlantCare,
        { page: 1, limit: 3 },
      );
      if (careResponse?.data) {
        const activities = careResponse.data.slice(0, 3).map((item: any) => ({
          id: item.id,
          type: item.eventType.includes("WATERING") ? "water" : "light",
          plant: item.metadata?.ruleName || "Plants",
          timestamp: new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setRecentActivity(activities);
      }
    } catch (err) {
      setRecentActivity([]);
    }
  }, [getPlantCare, setActivityLoading, setRecentActivity]);

  const fetchNotificationStatus = useCallback(async () => {
    try {
      const response: NotificationsResponseDTO =
        await notificationService.getAllNotifications(fetchNotificationCount);
      setHasUnread((response?.unreadCount ?? 0) > 0);
    } catch (error) {
      console.error("Failed to fetch notification status:", error);
    }
  }, [fetchNotificationCount]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchSummary();
      fetchActivity();
      fetchNotificationStatus();
    }, [fetchUserInfo, fetchSummary, fetchActivity, fetchNotificationStatus]),
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNotificationPress = () => router.push("/notifications");
  const handleCardPress = (type: string) =>
    router.push(type === "racks" ? "/(tabs)/(racks)" : "/(tabs)/(plants)");
  const handleAddRack = () => console.log("Add Rack");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row justify-between items-center px-5 mt-7">
          <Text style={typography["h1-bold"]} className="text-black">
            Hi {displayName}!
          </Text>
          <TouchableOpacity onPress={handleNotificationPress}>
            {hasUnread ? (
              <ActiveNotificationIcon width={24} height={24} />
            ) : (
              <InactiveNotificationIcon width={24} height={24} />
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-white mt-2">
          <View className="bg-white py-5 w-full">
            {isSummaryLoading ? (
              <SummaryCardSkeleton />
            ) : (
              <SummaryCard cards={summary} onCardPress={handleCardPress} />
            )}
          </View>
          <View className="px-4">
            <Highlight
              title={highlight.title}
              description={highlight.description}
              buttonText={highlight.buttonText}
              onButtonPress={handleAddRack}
            />
          </View>
          <View className="px-4 pb-8 mt-2">
            {isActivityLoading ? (
              <RecentActivityBarSkeleton />
            ) : (
              <RecentActivityBar activities={recentActivity} />
            )}
          </View>
        </View>
      </ScrollView>

      {shouldShow && currentTutorial && (
        <OnboardingTutorialModal
          visible={shouldShow}
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
