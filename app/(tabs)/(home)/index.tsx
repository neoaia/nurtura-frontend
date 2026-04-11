import { typography } from "@/assets/fonts/Text";
import { RecentActivityBarSkeleton } from "@/components/home/skeleton/recentActivityBarSkeleton";
import { SummaryCardSkeleton } from "@/components/home/skeleton/summaryCardSkeleton";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import type { DropdownOption } from "@/components/shared/dropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncState } from "@/hooks/useAsyncState";
import useFetch from "@/hooks/useFetch";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSocket } from "@/hooks/useSocket";
import { notificationService } from "@/services/notificationService";
import { plantService } from "@/services/plantService";
import { rackService } from "@/services/rackService";
import { userService } from "@/services/userService";
import { ActivityDTO } from "@/types/activity.dto";
import { UserDetails } from "@/types/interface";
import { AutomationActivity, Notification } from "@/types/socket.interface";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { socketService } from "@/utils/websocket/socket";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActiveNotificationIcon from "../../../assets/images/icons/home/active_notification.svg";
import InactiveNotificationIcon from "../../../assets/images/icons/home/inactive_notification.svg";
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

// ─── Helper ───────────────────────────────────────────────────────────────────

const mapAutomationActivityToDTO = (
  activity: AutomationActivity,
): ActivityDTO => {
  const dateObj = new Date(activity.timestamp);
  const isWater =
    activity.eventType === "WATERING_START" ||
    activity.eventType === "WATERING_STOP";

  return {
    id: activity.id,
    type: isWater ? "water" : "light",
    eventType: activity.eventType as ActivityDTO["eventType"],
    plantName: activity.metadata?.ruleName || "Plants",
    rackName: activity.metadata?.rackName || "Unknown Rack",
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: dateObj,
    amount: activity.metadata?.waterUsedMl,
    duration: activity.metadata?.durationSeconds
      ? `${Math.round(activity.metadata.durationSeconds / 60)} mins`
      : undefined,
  };
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const navService = new NavigationService(router);
  const [userInfo, setUserInfo] = useState<Partial<UserDetails>>({});
  const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false);
  const [highlight] = useState(mockApiResponse.highlight);
  const [hasUnread, setHasUnread] = useState(false);
  const displayName = userInfo.firstName || "User";
  const subscribedRackIdsRef = useRef<string[]>([]);

  // ── Socket ─────────────────────────────────────────────────────────────────
  const { isConnected, socketService: hookSocketService } = useSocket();

  // ── Socket Handler ─────────────────────────────────────────────────────────
  const onUserNotification = useRef(
    (data: { notification: Notification; timestamp: string }) => {
      if (!data.notification.isRead) {
        setHasUnread(true);
      }
    },
  ).current;

  // ── Socket Setup ───────────────────────────────────────────────────────────
  const setupSocket = useCallback(async () => {
    if (!user?.token) return;

    try {
      await socketService.connect(user.token);

      socketService.off("userNotification", onUserNotification);
      socketService.on("userNotification", onUserNotification);

      socketService.subscribeToUserNotifications();
    } catch (error) {
      console.error("Socket setup failed in HomeScreen:", error);
    }
  }, [user?.token, onUserNotification]);

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
  } = useAsyncState<ActivityDTO[]>([]);

  const [rackOptions, setRackOptions] = useState<DropdownOption[]>([]);
  const recentActivityRef = useRef<ActivityDTO[]>([]);

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

  const { refetch: fetchRacks } = useFetch("/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: checkUnreadNotifications } = useFetch(
    "/notifications/has-unread",
    {
      method: "GET",
      autoFetch: false,
      withAuth: true,
    },
  );

  const fetchUnreadStatus = useCallback(async () => {
    try {
      const response = await notificationService.checkForUnreadNotifications(
        checkUnreadNotifications,
      );
      setHasUnread(response?.hasUnread ?? false);
    } catch {
      // silently fail — websocket will keep it updated
    }
  }, [checkUnreadNotifications]);

  // ── Load rack list ──────────────────────────────────────────────────────────
  const loadRacks = useCallback(async () => {
    try {
      const response = await rackService.getAllUserRack(fetchRacks);
      if (response?.data) {
        const options: DropdownOption[] = response.data
          .filter((rack: any) => rack.isActive)
          .map((rack: any) => ({
            id: rack.id,
            label: rack.name,
            value: rack.id,
          }));
        setRackOptions(options);
      }
    } catch (e) {
      console.error("Failed to load racks:", e);
    }
  }, [fetchRacks]);

  useEffect(() => {
    loadRacks();
  }, [loadRacks]);

  // ── Fetch logic ────────────────────────────────────────────────────────────
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await userService.getUser(getUserInfo);
      if (response?.userInfo) setUserInfo(response.userInfo);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUserInfoLoaded(true);
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
    } catch {
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
        const mapped: ActivityDTO[] = careResponse.data
          .slice(0, 3)
          .map((item: any) => {
            const dateObj = new Date(item.timestamp);
            const isWater = item.eventType?.includes("WATERING");
            return {
              id: item.id,
              type: (isWater ? "water" : "light") as "water" | "light",
              eventType: item.eventType as ActivityDTO["eventType"],
              plantName: item.metadata?.ruleName ?? "Plants",
              rackName: item.metadata?.rackName ?? "Unknown Rack",
              time: dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: dateObj,
              amount: item.metadata?.waterUsedMl,
              duration: item.metadata?.durationSeconds
                ? `${Math.round(item.metadata.durationSeconds / 60)} mins`
                : undefined,
            };
          });
        setRecentActivity(mapped);
        recentActivityRef.current = mapped;
      }
    } catch {
      setRecentActivity([]);
    }
  }, [getPlantCare, setActivityLoading, setRecentActivity]);

  // ── WebSocket: subscribe to all racks ─────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    subscribedRackIdsRef.current.forEach((id) =>
      hookSocketService.unsubscribeFromRack(id),
    );

    // No rack filter on home — subscribe to all racks
    const idsToSubscribe = rackOptions.map((r) => r.value);

    idsToSubscribe.forEach((id) => hookSocketService.subscribeToRack(id));
    subscribedRackIdsRef.current = idsToSubscribe;

    return () => {
      subscribedRackIdsRef.current.forEach((id) =>
        hookSocketService.unsubscribeFromRack(id),
      );
      subscribedRackIdsRef.current = [];
    };
  }, [isConnected, hookSocketService, rackOptions]);

  // ── WebSocket: listen for new automation events ────────────────────────────
  useEffect(() => {
    const handleAutomationEvent = (data: any) => {
      // FIX: Handle both payload shapes — { event, activity } or the raw activity object directly
      const activity: AutomationActivity = data?.event.activity ?? data;
      console.log("[HomeScreen] Received automation event:", {
        payload: data,
        extracted: activity,
      });

      // FIX: Guard against malformed/undefined payloads before accessing .timestamp
      if (!activity || !activity.timestamp) {
        console.warn("[HomeScreen] Received malformed automation event:", data);
        return;
      }

      const newActivity = mapAutomationActivityToDTO(activity);

      const prev = recentActivityRef.current;
      if (prev.some((a: ActivityDTO) => a.id === newActivity.id)) {
        console.log("[HomeScreen] Duplicated event, skipping");
        return;
      }
      const updated = [newActivity, ...prev].slice(0, 3);
      recentActivityRef.current = updated;
      setRecentActivity(updated);
      console.log("[HomeScreen] Added new activity, total:", updated.length);
    };

    hookSocketService.on("automationEvent", handleAutomationEvent);
    return () =>
      hookSocketService.off("automationEvent", handleAutomationEvent);
  }, [hookSocketService, setRecentActivity]);

  // ── Focus Effect ───────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchUnreadStatus();
      fetchSummary();
      fetchActivity();
      setupSocket();

      return () => {
        socketService.off("userNotification", onUserNotification);
        socketService.unsubscribeFromUserNotifications();
      };
    }, [
      fetchUserInfo,
      fetchUnreadStatus,
      fetchSummary,
      fetchActivity,
      setupSocket,
      onUserNotification,
    ]),
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNotificationPress = () => {
    setHasUnread(false);
    navService.push(ROUTES.TABS.HOME.NOTIFICATIONS);
  };
  const handleCardPress = (type: string) =>
    navService.push(ROUTES.TABS.RACKS.ROOT);
  const handleAddRack = () => navService.push(ROUTES.TABS.ADD.RACK.STEP_1);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row justify-between items-center pl-5 pr-6 mt-7">
          <Text style={typography["h1-bold"]} className="text-black">
            Hi{" "}
            {displayName?.length > 10
              ? `${displayName.substring(0, 10)}...`
              : displayName}
            !
          </Text>
          <DebouncedTouchableOpacity onPress={handleNotificationPress}>
            {hasUnread ? (
              <ActiveNotificationIcon width={24} height={24} />
            ) : (
              <InactiveNotificationIcon width={24} height={24} />
            )}
          </DebouncedTouchableOpacity>
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

      {shouldShow && isUserInfoLoaded && currentTutorial && (
        <OnboardingTutorialModal
          visible={shouldShow && isUserInfoLoaded}
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
