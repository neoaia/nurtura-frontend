import { typography } from "@/assets/fonts/Text";
import {
  RackActivityItem,
  RackActivityItemProps,
} from "@/components/activity/rackActivityItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import useFetch from "@/hooks/useFetch";
import { activityService } from "@/services/activityService";
import { RackActivityDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  dateToday: Date;
  formatDate: (date: Date) => string;
}

const ListHeader: React.FC<ListHeaderProps> = ({
  dateRange,
  setDateRange,
  dateToday,
  formatDate,
}) => (
  <View className="bg-white">
    <View className="mt-4">
      <DateRangePicker value={dateRange} onChange={setDateRange} />
    </View>

    <View className="mt-6 mb-4 flex-row justify-between items-center">
      <Text style={typography["button-bold"]} className="text-black text-lg">
        {formatDate(dateToday)}
      </Text>
    </View>
  </View>
);

// ─── Mapper ───────────────────────────────────────────────────────────────────
const toActivityItemProps = (item: RackActivityDTO): RackActivityItemProps => {
  const date = new Date(item.timestamp);

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateStr = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const rackNameNew =
    item.eventType === "RACK_RENAMED"
      ? (item.metadata?.newName as string | undefined)
      : undefined;

  return {
    id: item.id,
    eventType: item.eventType,
    rackName: item.rack.name,
    rackNameNew,
    date: dateStr,
    time,
  };
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const RackActivity = () => {
  const dateToday = new Date();

  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const [activities, setActivities] = useState<RackActivityItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Static URL — query params are passed via refetch({ params }) instead
  const { refetch: getRackActivities } = useFetch("/api/racks/activities", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const fetchActivities = useCallback(async () => {
    try {
      const response = await activityService.getRackActivities(
        getRackActivities,
        {
          page: 1,
          limit: 20,
          ...(dateRange.start && { startDate: dateRange.start.toISOString() }),
          ...(dateRange.end && { endDate: dateRange.end.toISOString() }),
        },
      );
      setActivities(response.data.map(toActivityItemProps));
    } catch (error) {
      console.error("Failed to fetch rack activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [getRackActivities, dateRange]);

  // Handles both initial load and date range filter changes.
  // Single trigger avoids the race condition caused by useFocusEffect
  // and useEffect firing simultaneously on mount.
  useEffect(() => {
    setLoading(true);
    fetchActivities();
  }, [dateRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [fetchActivities]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RackActivityItem {...item} />}
      ListHeaderComponent={
        <ListHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          dateToday={dateToday}
          formatDate={formatDate}
        />
      }
      contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 24 }}
      className="bg-white flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["subheader"]} className="text-grayText">
            {loading
              ? "Loading activity..."
              : "No rack activity found for this range."}
          </Text>
        </View>
      )}
    />
  );
};

export default RackActivity;
