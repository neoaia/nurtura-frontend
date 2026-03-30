import { typography } from "@/assets/fonts/Text";
import {
  RackActivityItem,
  RackActivityItemProps,
} from "@/components/activity/rackActivityItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import useFetch from "@/hooks/useFetch";
import { activityService } from "@/services/activityService";
import {
  GetRackActivitiesResponseDTO,
  RackActivityDTO,
} from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SectionList, Text, View } from "react-native";

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({ dateRange, setDateRange }) => (
  <View className="bg-white">
    <View className="mt-4 mb-4">
      <DateRangePicker value={dateRange} onChange={setDateRange} />
    </View>
  </View>
);

const groupActivitiesByDate = (
  data: (RackActivityItemProps & { timestamp: string })[],
) => {
  const groups: { [key: string]: RackActivityItemProps[] } = {};
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterday = today - 86400000;

  data.forEach((item) => {
    const itemDate = new Date(item.timestamp).setHours(0, 0, 0, 0);
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

const toActivityItemProps = (
  item: RackActivityDTO,
): RackActivityItemProps & { timestamp: string } => {
  const dateObj = new Date(item.timestamp);

  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateStr = dateObj.toLocaleDateString("en-US", {
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
    timestamp: item.timestamp,
  };
};

const RackActivity = () => {
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const [activities, setActivities] = useState<
    (RackActivityItemProps & { timestamp: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { refetch: getRackActivities } = useFetch("/api/racks/activities", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const fetchActivities = useCallback(async () => {
    try {
      const startISO = dateRange.start
        ? new Date(dateRange.start.setHours(0, 0, 0, 0)).toISOString()
        : undefined;
      const endISO = dateRange.end
        ? new Date(dateRange.end.setHours(23, 59, 59, 999)).toISOString()
        : undefined;

      const response: GetRackActivitiesResponseDTO =
        await activityService.getRackActivities(getRackActivities, {
          page: 1,
          limit: 50,
          startDate: startISO,
          endDate: endISO,
        });

      if (response && response.data) {
        setActivities(response.data.map(toActivityItemProps));
      }
    } catch (error) {
      console.error("Failed to fetch rack activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [getRackActivities, dateRange]);

  useEffect(() => {
    setLoading(true);
    fetchActivities();
  }, [fetchActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [fetchActivities]);

  const sections = groupActivitiesByDate(activities);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RackActivityItem {...item} />}
      renderSectionHeader={({ section: { title } }) => (
        <View className="bg-white py-3">
          <Text
            style={typography["button-bold"]}
            className="text-black text-lg"
          >
            {title}
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <ListHeader dateRange={dateRange} setDateRange={setDateRange} />
      }
      contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}
      className="bg-white flex-1"
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["label"]} className="text-gray-400">
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
