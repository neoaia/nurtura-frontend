import { typography } from "@/assets/fonts/Text";
import { RecentActivityBarSkeleton } from "@/components/home/skeleton/recentActivityBarSkeleton";
import { SummaryCardSkeleton } from "@/components/home/skeleton/summaryCardSkeleton";
import { useAsyncState } from "@/hooks/useAsyncState";
import useFetch from "@/hooks/useFetch";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
import { plantService } from "../../../services/plantService";
import { userService } from "../../../services/userService";
import {
  AddRackRequestDTO,
  AddRackResponseDTO,
  NotificationsResponseDTO,
} from "../../../types/home.dto";
import { UserDetails } from "../../../types/interface";

const NOTIFICATION_ICON_SIZE = 24;

const mockApiResponse = {
  user: { name: "User", hasNotifications: true },
  highlight: {
    title: "Farm Efficiently",
    description: "Start growing your plant with Nurtura Racks",
    buttonText: "Add Rack",
  },
};

export default function HomeScreen() {
  // ── States ────────────────────────────────────────────────────────────────
  const [userInfo, setUserInfo] = useState<Partial<UserDetails>>({});
  const [user] = useState(mockApiResponse.user);
  const [highlight] = useState(mockApiResponse.highlight);

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

  // ── useFetch hooks ────────────────────────────────────────────────────────
  const { refetch: getUserInfo } = useFetch("/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: fetchRacks } = useFetch("/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: fetchPlants } = useFetch("/plants", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: addRackRequest } = useFetch("/racks", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: getPlantCare } = useFetch("/racks/activities/plant-care", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  // ── Ref mirrors so callbacks always use latest refetch ────────────────────
  const fetchRacksRef = useRef(fetchRacks);
  const fetchPlantsRef = useRef(fetchPlants);
  const getPlantCareRef = useRef(getPlantCare);
  const getUserInfoRef = useRef(getUserInfo);
  const addRackRequestRef = useRef(addRackRequest);

  fetchRacksRef.current = fetchRacks;
  fetchPlantsRef.current = fetchPlants;
  getPlantCareRef.current = getPlantCare;
  getUserInfoRef.current = getUserInfo;
  addRackRequestRef.current = addRackRequest;

  // ── Generation counters — latest call wins, stale calls are discarded ─────
  // Problem this solves: useFocusEffect fires multiple times (mount + focus).
  // Each fire calls fetchSummary/fetchActivity, resetting skeleton each time.
  // With this pattern, only the LATEST call's result ever updates the UI.
  const summaryGenRef = useRef(0);
  const activityGenRef = useRef(0);

  // ── Fetch Logic ───────────────────────────────────────────────────────────
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await userService.getUser(getUserInfoRef.current);
      if (response?.userInfo) {
        setUserInfo({
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
  }, []);

  const fetchSummary = useCallback(async () => {
    // Stamp this call — if a newer call starts before this one finishes,
    // this call's result will be silently discarded.
    const gen = ++summaryGenRef.current;
    setSummaryLoading();

    try {
      const [racksResult, plantsResult] = await Promise.all([
        fetchRacksRef.current().catch((e) => {
          console.error("Failed to fetch racks:", e);
          return null;
        }),
        fetchPlantsRef.current().catch((e) => {
          console.error("Failed to fetch plants:", e);
          return null;
        }),
      ]);

      // Stale check: a newer fetchSummary() call has since started, bail out
      if (gen !== summaryGenRef.current) return;

      const racksCount =
        racksResult?.data?.data?.filter((rack: any) => rack.isActive === true)
          .length ?? 0;
      const plantsCount = plantsResult?.data?.meta?.totalItems ?? 0;

      // ✅ Atomic: clears skeleton + sets data in one render
      setSummary([
        {
          id: "racks",
          type: "racks",
          value: racksCount,
          isActive: !!racksResult?.data?.data,
        },
        {
          id: "plants",
          type: "plants",
          value: plantsCount,
          isActive: !!plantsResult?.data?.data,
        },
      ]);
    } catch (err) {
      console.error("Summary error:", err);
      if (gen !== summaryGenRef.current) return;
      setSummary([]);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    const gen = ++activityGenRef.current;
    setActivityLoading();

    try {
      const careResponse = await plantService
        .getPlantCareActivities(getPlantCareRef.current, { page: 1, limit: 3 })
        .catch((e) => {
          console.error("Failed to fetch plant care:", e);
          return null;
        });

      if (gen !== activityGenRef.current) return;

      if (!careResponse?.data) {
        setRecentActivity([]);
        return;
      }

      const activities = careResponse.data
        .filter((item: any) => item.eventType?.endsWith("_OFF"))
        .sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 3)
        .map((item: any) => {
          const isWater = item.eventType.includes("WATERING");
          const dateObj = new Date(item.timestamp);
          const durationMs = item.metadata?.duration;
          const duration = durationMs
            ? `${Math.round(durationMs / 60000)} mins`
            : undefined;

          return {
            id: item.id,
            type: isWater ? "water" : "light",
            action: isWater ? "Watered the" : "Gave light to",
            plant: item.metadata?.ruleName || "Plants",
            timestamp: dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration,
          };
        });

      setRecentActivity(activities);
    } catch (err) {
      console.error("Activity error:", err);
      if (gen !== activityGenRef.current) return;
      setRecentActivity([]);
    }
  }, []);

  const getNotifications = async (): Promise<NotificationsResponseDTO> => {
    try {
      return { notifications: [], unreadCount: 0 };
    } catch (err) {
      console.error("Error fetching notifications:", err);
      throw err;
    }
  };

  const addRack = async (
    rackData: AddRackRequestDTO,
  ): Promise<AddRackResponseDTO> => {
    try {
      const { data, error } = await addRackRequestRef.current({
        body: rackData,
      });
      if (error || !data) {
        return {
          success: false,
          message: error?.message || "Failed to add rack",
        };
      }
      fetchSummary();
      fetchActivity();
      return { success: true, message: "Rack added successfully" };
    } catch (err) {
      console.error("Error adding rack:", err);
      throw err;
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  // ── SILENT REFRESH on re-focus — NO skeleton reset, just background update ─
  // useAsyncState's setLoading() is a no-op once hasLoaded = true,
  // so re-focusing will never flash the skeleton again.
  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchSummary();
      fetchActivity();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const displayName = userInfo.firstName || user.name;

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
    </SafeAreaView>
  );
}
