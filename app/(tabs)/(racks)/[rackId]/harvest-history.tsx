import { typography } from "@/assets/fonts/Text";
import { HarvestItem } from "@/components/activity/harvestItem";
import TotalHarvestCard from "@/components/racks/totalHarvestCard";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import useFetch from "@/hooks/useFetch";
import { plantService } from "@/services/plantService";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

type HarvestRecord = {
  id: string;
  plantName: string;
  rackName: string;
  time: string;
  date: Date;
};

const getRelativeTime = (date: Date): string => {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const HarvestHistory = () => {
  const { rackId, rackName } = useLocalSearchParams<{
    rackId: string;
    rackName: string;
  }>();

  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { refetch: getHarvestActivities } = useFetch(
    "/racks/activities/harvest",
    { method: "GET", autoFetch: false, withAuth: true },
  );

  const fetchHarvests = useCallback(async () => {
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

      const response = await plantService.getPlantHarvestActivities(
        getHarvestActivities,
        {
          page: 1,
          limit: 50,
          startDate: startISO,
          endDate: endISO,
          rackId: rackId,
        },
      );

      if (response?.data) {
        const mapped: HarvestRecord[] = response.data.map((item: any) => {
          const dateObj = new Date(item.timestamp);
          return {
            id: item.id,
            plantName: item.metadata?.plantName || "Unknown Plant",
            rackName: rackName ?? item.metadata?.rackName ?? "Unknown Rack",
            time: getRelativeTime(dateObj),
            date: dateObj,
          };
        });
        setHarvests(mapped);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, rackId, rackName, getHarvestActivities]);

  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHarvests();
    setRefreshing(false);
  }, [fetchHarvests]);

  const totalFrequency = harvests.length;
  const sinceDate =
    harvests.length > 0
      ? new Date(
          Math.min(...harvests.map((h) => h.date.getTime())),
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 py-4 bg-white">
        {/* Date filter */}
        <View className="mb-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </View>

        {/* Summary card */}
        <TotalHarvestCard harvest={{ totalFrequency, sinceDate }} />

        {/* List */}
        <View className="mt-6">
          {loading ? (
            <Text
              style={typography["label"]}
              className="text-gray-400 text-center mt-4"
            >
              Loading harvests...
            </Text>
          ) : harvests.length === 0 ? (
            <Text
              style={typography["label"]}
              className="text-gray-400 text-center mt-4"
            >
              No harvests found.
            </Text>
          ) : (
            harvests.map((item) => (
              <HarvestItem
                key={item.id}
                id={item.id}
                plantName={item.plantName}
                rackName={item.rackName}
                time={item.time}
                date={item.date}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HarvestHistory;
