import { typography } from "@/assets/fonts/Text";
import { ActivityItem } from "@/components/activity/activityItem";
import { ActivityButton } from "@/components/activity/sensorToggle";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import useFetch from "@/hooks/useFetch";
import { useSocket } from "@/hooks/useSocket";
import { plantService } from "@/services/plantService";
import { ActivityDTO } from "@/types/activity.dto";
import { AutomationActivity } from "@/types/socket.interface";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SectionList, Text, View } from "react-native";

type ActivityWithDate = ActivityDTO & { date: Date };

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true when `date` falls within the [start, end] range.
 * Null boundaries are treated as open-ended.
 */
const isWithinDateRange = (
  date: Date,
  range: { start: Date | null; end: Date | null },
): boolean => {
  if (
    range.start &&
    date < new Date(new Date(range.start).setHours(0, 0, 0, 0))
  )
    return false;
  if (
    range.end &&
    date > new Date(new Date(range.end).setHours(23, 59, 59, 999))
  )
    return false;
  return true;
};

/** Maps a raw AutomationActivity (from socket) to the local ActivityWithDate shape. */
const mapAutomationActivityToDTO = (
  activity: AutomationActivity,
  rackName: string,
): ActivityWithDate => {
  const dateObj = new Date(activity.timestamp);
  const isWater =
    activity.eventType === "WATERING_START" ||
    activity.eventType === "WATERING_STOP";

  return {
    id: activity.id,
    type: isWater ? "water" : "light",
    plantName: activity.metadata?.ruleName || "Plants",
    rackName: activity.metadata?.rackName || rackName || "Unknown Rack",
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

const groupActivitiesByDate = (data: ActivityWithDate[]) => {
  const groups: { [key: string]: ActivityWithDate[] } = {};
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterday = today - 86400000;

  data.forEach((item) => {
    const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
    let title = "";

    if (itemDate === today) {
      title = "Today";
    } else if (itemDate === yesterday) {
      title = "Yesterday";
    } else {
      title = new Date(itemDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups[title]) groups[title] = [];
    groups[title].push(item);
  });

  return Object.keys(groups).map((date) => ({
    title: date,
    data: groups[date],
  }));
};

// ─── Care ────────────────────────────────────────────────────────────────────

const Care = () => {
  const { rackId, rackName } = useLocalSearchParams<{
    rackId: string;
    rackName: string;
  }>();

  const [activeTab, setActiveTab] = useState<"water" | "light">("water");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [activities, setActivities] = useState<ActivityWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Socket ────────────────────────────────────────────────────────────────
  const { isConnected, socketService } = useSocket();

  // ── HTTP fetcher ──────────────────────────────────────────────────────────
  const { refetch: getPlantCare } = useFetch("/racks/activities/plant-care", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  // ── HTTP: initial activity load ───────────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const startISO = dateRange.start
        ? new Date(new Date(dateRange.start).setHours(0, 0, 0, 0)).toISOString()
        : undefined;
      const endISO = dateRange.end
        ? new Date(
            new Date(dateRange.end).setHours(23, 59, 59, 999),
          ).toISOString()
        : undefined;

      const response = await plantService.getPlantCareActivities(getPlantCare, {
        page: 1,
        limit: 50,
        startDate: startISO,
        endDate: endISO,
        rackId: rackId,
      });

      if (response?.data) {
        const mappedData: ActivityWithDate[] = response.data.map(
          (item: any) => {
            const dateObj = new Date(item.timestamp);
            const isWater =
              item.eventType?.includes("WATERING") ||
              item.eventType?.includes("WATER");

            return {
              id: item.id,
              type: (isWater ? "water" : "light") as "water" | "light",
              plantName: item.metadata?.ruleName || "Plants",
              rackName: rackName ?? "Unknown Rack",
              time: dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: dateObj,
              amount: item.metadata?.amount,
              duration: item.metadata?.duration
                ? `${Math.round(item.metadata.duration / 60000)} mins`
                : undefined,
            };
          },
        );
        setActivities(mappedData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, rackId, rackName, getPlantCare]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // ── WebSocket: subscribe to this rack ─────────────────────────────────────
  useEffect(() => {
    if (!isConnected || !rackId) return;

    socketService.subscribeToRack(rackId);

    return () => {
      socketService.unsubscribeFromRack(rackId);
    };
  }, [isConnected, rackId, socketService]);

  // ── WebSocket: listen for new automation events ───────────────────────────
  useEffect(() => {
    const handleAutomationEvent = (data: any) => {
      const activity: AutomationActivity = data?.event?.activity ?? data;

      if (!activity || !activity.timestamp) {
        console.warn("Received malformed automation event:", data);
        return;
      }

      // Drop if the event belongs to a different rack
      if (activity.rackId !== rackId) return;

      const eventDate = new Date(activity.timestamp);

      // Drop the event if it falls outside the current date filter
      if (!isWithinDateRange(eventDate, dateRange)) return;

      const newActivity = mapAutomationActivityToDTO(
        activity,
        rackName ?? "Unknown Rack",
      );

      setActivities((prev) => {
        // Guard against duplicate events (e.g. after a reconnect)
        if (prev.some((a) => a.id === newActivity.id)) return prev;
        return [newActivity, ...prev];
      });
    };

    socketService.on("automationEvent", handleAutomationEvent);
    return () => socketService.off("automationEvent", handleAutomationEvent);
  }, [dateRange, rackId, rackName, socketService]);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [fetchActivities]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredActivities = activities.filter(
    (item) => item.type === activeTab,
  );
  const sections = groupActivitiesByDate(filteredActivities);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="px-4">
          <ActivityItem {...item} />
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <View className="bg-white py-3 px-4">
          <Text
            style={typography["button-bold"]}
            className="text-black text-lg"
          >
            {title}
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <View className="bg-white px-4 pt-4">
          <View className="gap-3 mb-4">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </View>
          <View className="flex-row justify-center mb-3">
            <ActivityButton
              status={activeTab === "water" ? "clickedWater" : "defaultWater"}
              onPress={() => setActiveTab("water")}
            />
            <ActivityButton
              status={activeTab === "light" ? "clickedLight" : "defaultLight"}
              onPress={() => setActiveTab("light")}
            />
          </View>
        </View>
      }
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["label"]} className="text-gray-400">
            {loading ? "Loading..." : `No ${activeTab} activities found.`}
          </Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 40 }}
      className="bg-white flex-1"
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

export default Care;
